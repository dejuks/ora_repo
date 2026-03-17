import { createCrudController } from "./createCrudController.js";
import { PurchaseOrderModel } from "../models/purchaseOrder.model.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import pool from "../../config/db.js";

const crud = createCrudController(PurchaseOrderModel, "purchase-order");

const normalizePayload = (body = {}, userUuid = null) => {
  const status = body.status || "draft";
  return {
    request_id: body.request_id || null,
    vendor_id: body.vendor_id || null,
    po_number: body.po_number,
    ordered_by: body.ordered_by || userUuid || null,
    approved_by: ["approved", "sent", "partially_received", "received"].includes(status)
      ? (body.approved_by || userUuid || null)
      : (body.approved_by || null),
    order_date: body.order_date || null,
    expected_delivery_date: body.expected_delivery_date || null,
    total_amount: body.total_amount || null,
    status,
    note: body.note || null,
  };
};

const getPurchaseOrderWithItems = async (purchaseOrderId, client = pool) => {
  const poRes = await client.query(
    `SELECT po.*, v.name AS vendor_name, ar.title AS request_title
       FROM purchase_orders po
       LEFT JOIN vendors v ON v.vendor_id = po.vendor_id
       LEFT JOIN acquisition_requests ar ON ar.request_id = po.request_id
      WHERE po.purchase_order_id = $1
      LIMIT 1`,
    [purchaseOrderId]
  );
  const order = poRes.rows[0] || null;
  if (!order) return null;

  const itemsRes = await client.query(
    `SELECT poi.*,
            COALESCE(SUM(ari.received_quantity), 0)::int AS total_received_quantity,
            COALESCE(SUM(ari.accepted_quantity), 0)::int AS total_accepted_quantity,
            COALESCE(SUM(ari.rejected_quantity), 0)::int AS total_rejected_quantity
       FROM purchase_order_items poi
       LEFT JOIN acquisitions_receipt_items ari ON ari.po_item_id = poi.po_item_id
      WHERE poi.purchase_order_id = $1
      GROUP BY poi.po_item_id
      ORDER BY poi.title ASC`,
    [purchaseOrderId]
  );

  return {
    ...order,
    items: itemsRes.rows,
  };
};

const buildReceiptItems = (orderItems = [], requestedItems = []) => {
  if (Array.isArray(requestedItems) && requestedItems.length) {
    return requestedItems
      .map((item) => {
        const match = orderItems.find((row) => row.po_item_id === item.po_item_id);
        if (!match) return null;
        const remaining = Math.max(Number(match.quantity || 0) - Number(match.total_received_quantity || 0), 0);
        const received = Math.max(Number(item.received_quantity || 0), 0);
        const accepted = item.accepted_quantity === undefined || item.accepted_quantity === null || item.accepted_quantity === ""
          ? received
          : Math.max(Number(item.accepted_quantity || 0), 0);
        const rejected = item.rejected_quantity === undefined || item.rejected_quantity === null || item.rejected_quantity === ""
          ? Math.max(received - accepted, 0)
          : Math.max(Number(item.rejected_quantity || 0), 0);
        if (received <= 0 || remaining <= 0) return null;
        return {
          po_item_id: match.po_item_id,
          received_quantity: Math.min(received, remaining),
          accepted_quantity: Math.min(accepted, Math.min(received, remaining)),
          rejected_quantity: Math.min(rejected, Math.min(received, remaining)),
          condition_note: item.condition_note || null,
        };
      })
      .filter(Boolean);
  }

  return orderItems
    .map((item) => {
      const remaining = Math.max(Number(item.quantity || 0) - Number(item.total_received_quantity || 0), 0);
      if (remaining <= 0) return null;
      return {
        po_item_id: item.po_item_id,
        received_quantity: remaining,
        accepted_quantity: remaining,
        rejected_quantity: 0,
        condition_note: null,
      };
    })
    .filter(Boolean);
};

const receivePurchaseOrder = async (purchaseOrderId, body = {}, userUuid = null) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const order = await getPurchaseOrderWithItems(purchaseOrderId, client);
    if (!order) {
      const err = new Error("purchase-order not found");
      err.statusCode = 404;
      throw err;
    }

    const receiptItems = buildReceiptItems(order.items || [], body.items || []);
    if (!receiptItems.length) {
      const err = new Error("No receivable purchase order items found");
      err.statusCode = 400;
      throw err;
    }

    const receiptRes = await client.query(
      `INSERT INTO acquisitions_receipts (purchase_order_id, received_by, receipt_number, received_date, note)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        purchaseOrderId,
        userUuid || null,
        body.receipt_number || null,
        body.received_date || new Date().toISOString().slice(0, 10),
        body.note || null,
      ]
    );
    const receipt = receiptRes.rows[0];

    for (const item of receiptItems) {
      await client.query(
        `INSERT INTO acquisitions_receipt_items
         (receipt_id, po_item_id, received_quantity, accepted_quantity, rejected_quantity, condition_note)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          receipt.receipt_id,
          item.po_item_id,
          item.received_quantity,
          item.accepted_quantity,
          item.rejected_quantity,
          item.condition_note,
        ]
      );
    }

    const refreshed = await getPurchaseOrderWithItems(purchaseOrderId, client);
    const totalOrdered = (refreshed.items || []).reduce((sum, row) => sum + Number(row.quantity || 0), 0);
    const totalReceived = (refreshed.items || []).reduce((sum, row) => sum + Number(row.total_received_quantity || 0), 0);
    const nextStatus = totalReceived >= totalOrdered && totalOrdered > 0 ? "received" : "partially_received";

    const poUpdateRes = await client.query(
      `UPDATE purchase_orders
          SET status = $2,
              updated_at = NOW()
        WHERE purchase_order_id = $1
        RETURNING *`,
      [purchaseOrderId, nextStatus]
    );

    if (poUpdateRes.rows[0]?.request_id && nextStatus === "received") {
      await client.query(
        `UPDATE acquisition_requests
            SET status = 'closed',
                updated_at = NOW()
          WHERE request_id = $1`,
        [poUpdateRes.rows[0].request_id]
      );
    }

    await client.query("COMMIT");
    return {
      receipt,
      purchase_order: await getPurchaseOrderWithItems(purchaseOrderId, pool),
      summary: {
        total_ordered_quantity: totalOrdered,
        total_received_quantity: totalReceived,
        status: nextStatus,
      },
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const purchaseOrderController = {
  ...crud,
  store: asyncHandler(async (req, res) => {
    const row = await PurchaseOrderModel.create(normalizePayload(req.body || {}, req.user?.uuid || null));
    return res.status(201).json(row);
  }),
  update: asyncHandler(async (req, res) => {
    const row = await PurchaseOrderModel.update(req.params.id, normalizePayload(req.body || {}, req.user?.uuid || null));
    return res.json(row);
  }),
  show: asyncHandler(async (req, res) => {
    const row = await getPurchaseOrderWithItems(req.params.id);
    if (!row) {
      return res.status(404).json({ message: "purchase-order not found" });
    }
    return res.json(row);
  }),
  receive: asyncHandler(async (req, res) => {
    const result = await receivePurchaseOrder(req.params.id, req.body || {}, req.user?.uuid || null);
    return res.status(201).json(result);
  }),
};

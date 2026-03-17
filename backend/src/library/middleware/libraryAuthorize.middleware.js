import { authorize } from "../../middleware/rbac.middleware.js";

const methodMap = {
  GET: "read",
  POST: "create",
  PUT: "update",
  PATCH: "update",
  DELETE: "delete",
};

const resourcePermissionMap = {
  branches: {
    read: "library.branch.view",
    create: "library.branch.create",
    update: "library.branch.update",
    delete: "library.branch.delete",
  },

  locations: {
    read: "library.location.view",
    create: "library.location.create",
    update: "library.location.update",
    delete: "library.location.delete",
  },

  "material-types": {
    read: "library.materialtype.view",
    create: "library.materialtype.create",
    update: "library.materialtype.update",
    delete: "library.materialtype.delete",
  },

  categories: {
    read: "library.catalog.record.view",
    create: "library.catalog.record.create",
    update: "library.catalog.record.update",
    delete: "library.catalog.record.delete",
  },

  subjects: {
    read: "library.catalog.record.view",
    create: "library.catalog.subject.assign",
    update: "library.catalog.subject.assign",
    delete: "library.catalog.subject.assign",
  },

  languages: {
    read: "library.language.view",
    create: "library.language.create",
    update: "library.language.update",
    delete: "library.language.delete",
  },

  publishers: {
    read: "library.publisher.view",
    create: "library.publisher.create",
    update: "library.publisher.update",
    delete: "library.publisher.delete",
  },

  contributors: {
    read: "library.contributor.view",
    create: "library.contributor.create",
    update: "library.contributor.update",
    delete: "library.contributor.delete",
  },

  "member-types": {
    read: "library.membertype.view",
    create: "library.membertype.create",
    update: "library.membertype.update",
    delete: "library.membertype.delete",
  },

  members: {
    read: "library.member.view",
    create: "library.member.create",
    update: "library.member.update",
    delete: "library.member.delete",
  },

  "member-status-history": {
    read: "library.member.status.view",
    create: "library.member.status.create",
    update: "library.member.status.update",
    delete: "library.member.status.delete",
  },

  materials: {
    read: "library.book.view",
    create: "library.book.create",
    update: "library.book.update",
    delete: "library.book.delete",
  },

  "material-contributors": {
    read: "library.material.contributor.view",
    create: "library.material.contributor.create",
    update: "library.material.contributor.update",
    delete: "library.material.contributor.delete",
  },

  "material-subjects": {
    read: "library.material.subject.view",
    create: "library.material.subject.create",
    update: "library.material.subject.update",
    delete: "library.material.subject.delete",
  },

  copies: {
    read: "library.copy.view",
    create: "library.copy.create",
    update: "library.copy.update",
    delete: "library.copy.delete",
  },

  "circulation-policies": {
    read: "library.policy.view",
    create: "library.policy.update",
    update: "library.policy.update",
    delete: "library.policy.update",
  },

  loans: {
    read: "library.loan.view",
    create: "library.loan.create",
    issue: "library.loan.issue",
    return: "library.loan.return",
    renew: "library.loan.renew",
  },

  "loan-renewals": {
    read: "library.loan.renewal.view",
    create: "library.loan.renewal.create",
    update: "library.loan.renewal.update",
    delete: "library.loan.renewal.delete",
  },

  holds: {
    read: "library.hold.view",
    create: "library.hold.create",
    cancel: "library.hold.cancel",
    fulfill: "library.hold.fulfill",
  },

  fines: {
    read: "library.fine.view",
    create: "library.fine.create",
    pay: "library.fine.collect",
    waive: "library.fine.waive",
  },

  "fine-payments": {
    read: "library.fine.payment.view",
    create: "library.fine.payment.create",
    update: "library.fine.payment.update",
    delete: "library.fine.payment.delete",
  },

  "fine-waivers": {
    read: "library.fine.waiver.view",
    create: "library.fine.waiver.create",
    update: "library.fine.waiver.update",
    delete: "library.fine.waiver.delete",
  },

  "damage-reports": {
    read: "library.inventory.damaged.report",
    create: "library.inventory.damaged.report",
    update: "library.inventory.damaged.report",
    delete: "library.inventory.damaged.report",
  },

  "lost-item-reports": {
    read: "library.inventory.missing.report",
    create: "library.inventory.missing.report",
    update: "library.inventory.missing.report",
    delete: "library.inventory.missing.report",
  },

  vendors: {
    read: "library.vendor.view",
    create: "library.vendor.create",
    update: "library.vendor.update",
    delete: "library.vendor.update",
  },

  "acquisition-requests": {
    read: "library.acquisition.request.view",
    create: "library.acquisition.request.create",
    update: "library.acquisition.request.approve",
    delete: "library.acquisition.request.approve",
  },

  "purchase-orders": {
    read: "library.acquisition.order.view",
    create: "library.acquisition.order.create",
    update: "library.acquisition.order.update",
    delete: "library.acquisition.order.update",
  },

  "purchase-order-items": {
    read: "library.purchase.order.item.view",
    create: "library.purchase.order.item.create",
    update: "library.purchase.order.item.update",
    delete: "library.purchase.order.item.delete",
  },

  "acquisition-receipts": {
    read: "library.acquisition.order.view",
    create: "library.acquisition.delivery.receive",
    update: "library.acquisition.delivery.inspect",
    delete: "library.acquisition.delivery.inspect",
  },

  "acquisition-receipt-items": {
    read: "library.acquisition.receipt.item.view",
    create: "library.acquisition.receipt.item.create",
    update: "library.acquisition.receipt.item.update",
    delete: "library.acquisition.receipt.item.delete",
  },

  "cataloging-jobs": {
    read: "library.cataloging.job.view",
    create: "library.cataloging.job.create",
    update: "library.cataloging.job.update",
    delete: "library.cataloging.job.delete",
  },

  "inventory-audits": {
    read: "library.inventory.audit.view",
    create: "library.inventory.audit.create",
    update: "library.inventory.audit.update",
    delete: "library.inventory.audit.update",
  },

  "inventory-audit-items": {
    read: "library.inventory.audit.item.view",
    create: "library.inventory.audit.item.create",
    update: "library.inventory.audit.item.update",
    delete: "library.inventory.audit.item.delete",
  },

  "digital-resources": {
    read: "library.digital.resource.view",
    create: "library.digital.resource.create",
    update: "library.digital.resource.update",
    delete: "library.digital.resource.delete",
    download: "library.digital.resource.download",
  },

  "digital-resource-files": {
    read: "library.digital.file.view",
    create: "library.digital.file.create",
    update: "library.digital.file.update",
    delete: "library.digital.file.delete",
  },

  "digital-access-rules": {
    read: "library.digital.accessrule.view",
    create: "library.digital.accessrule.create",
    update: "library.digital.accessrule.update",
    delete: "library.digital.accessrule.delete",
  },

  "digital-usage-logs": {
    read: "library.digital.usage.view",
  },

  "digital-submissions": {
    read: "library.digital.resource.view",
    create: "library.digital.resource.create",
    submit: "library.digital.resource.submit",
    review: "library.digital.resource.approve",
    publish: "library.digital.resource.publish",
    update: "library.digital.resource.update",
    delete: "library.digital.resource.delete",
  },

  "digital-submission-contributors": {
    read: "library.digital.resource.view",
    create: "library.digital.resource.create",
    update: "library.digital.resource.update",
    delete: "library.digital.resource.delete",
  },

  "digital-submission-files": {
    read: "library.digital.submission.file.view",
    create: "library.digital.submission.file.create",
    update: "library.digital.submission.file.update",
    delete: "library.digital.submission.file.delete",
  },

  "digital-submission-reviews": {
    read: "library.digital.submission.review.view",
    create: "library.digital.submission.review.create",
    update: "library.digital.submission.review.update",
    delete: "library.digital.submission.review.delete",
  },

  "digital-submission-status-history": {
    read: "library.digital.submission.history.view",
    create: "library.digital.submission.history.create",
    update: "library.digital.submission.history.update",
    delete: "library.digital.submission.history.delete",
  },

  "digital-submission-publications": {
    read: "library.digital.submission.publication.view",
    create: "library.digital.submission.publication.create",
    update: "library.digital.submission.publication.update",
    delete: "library.digital.submission.publication.delete",
  },

  notifications: {
    read: "library.notification.view",
    create: "library.notification.create",
    update: "library.notification.update",
    delete: "library.notification.delete",
  },

  "audit-logs": {
    read: "library.auditlog.view",
  },

  reports: {
    read: "library.reports.view",
  },

  maintenance: {
    read: "system.logs.view",
    create: "system.settings.update",
    update: "system.settings.update",
    delete: "system.settings.update",
  },
};

export const authorizeLibraryAction = (permission) => authorize(permission);

export const resolveLibraryPermission = (req, res, next) => {
  const pathParts = req.path.split("/").filter(Boolean);
  const resource = pathParts[0];
  const map = resourcePermissionMap[resource];

  if (!map) return next();

  let action = methodMap[req.method];

  if (resource === "loans" && req.method === "POST") {
    if (pathParts[1] === "borrow") action = "issue";
    else if (pathParts[2] === "return") action = "return";
    else if (pathParts[2] === "renew") action = "renew";
  }

  if (resource === "holds" && req.method === "POST") {
    if (pathParts[2] === "cancel") action = "cancel";
    else if (pathParts[2] === "fulfill") action = "fulfill";
  }

  if (resource === "fines" && req.method === "POST") {
    if (pathParts[2] === "pay") action = "pay";
    else if (pathParts[2] === "waive") action = "waive";
  }

  if (resource === "digital-submissions" && req.method === "POST") {
    if (pathParts[2] === "submit") action = "submit";
    else if (pathParts[2] === "review") action = "review";
    else if (pathParts[2] === "publish") action = "publish";
  }

  if (
    resource === "digital-resources" &&
    req.method === "GET" &&
    pathParts[2] === "download"
  ) {
    action = "download";
  }

  if (resource === "reports") {
    action = "read";
  }

  const permission = map[action];
  if (!permission) return next();

  return authorize(permission)(req, res, next);
};
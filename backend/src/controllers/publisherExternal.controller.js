import { createPublisherPackage, createPublisherResource, listPublisherPackages } from "../library/services/externalPublisher.service.js";

export const listPackages = async (req, res, next) => {
  try {
    const rows = await listPublisherPackages(req.query);
    res.json({ rows });
  } catch (error) {
    next(error);
  }
};

export const createPackage = async (req, res, next) => {
  try {
    const row = await createPublisherPackage({
      payload: req.body,
      file: req.file,
      actorUserId: req.user?.uuid || null,
      ipAddress: req.ip,
      userAgent: req.get('user-agent') || null,
    });
    res.status(201).json(row);
  } catch (error) {
    next(error);
  }
};

export const createResource = async (req, res, next) => {
  try {
    const row = await createPublisherResource({
      payload: req.body,
      file: req.file,
      actorUserId: req.user?.uuid || null,
      ipAddress: req.ip,
      userAgent: req.get('user-agent') || null,
    });
    res.status(201).json(row);
  } catch (error) {
    next(error);
  }
};

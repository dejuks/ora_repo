import express from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { paginationRules, uuidParam } from "../validators/common.validators.js";

export const createCrudRouter = (
  controller,
  { withAuth = true, createValidators = [], updateValidators = [], idParam = 'id', extraMiddlewares = [] } = {}
) => {
  const router = express.Router();
  if (withAuth) router.use(authenticate);
  extraMiddlewares.forEach((mw) => router.use(mw));
  router.get('/', paginationRules, validateRequest, controller.index);
  router.get(`/:${idParam}`, uuidParam(idParam), validateRequest, controller.show);
  router.post('/', ...createValidators, validateRequest, controller.store);
  router.put(`/:${idParam}`, uuidParam(idParam), ...updateValidators, validateRequest, controller.update);
  router.patch(`/:${idParam}`, uuidParam(idParam), ...updateValidators, validateRequest, controller.update);
  router.delete(`/:${idParam}`, uuidParam(idParam), validateRequest, controller.destroy);
  return router;
};

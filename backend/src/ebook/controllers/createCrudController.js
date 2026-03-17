const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const notFound = (message = "Not found") => {
  const error = new Error(message);
  error.status = 404;
  return error;
};

export const createCrudController = (model, resourceLabel) => ({
  index: asyncHandler(async (req, res) => {
    const result = await model.findAll(req.query || {});
    res.json(result);
  }),
  show: asyncHandler(async (req, res) => {
    const row = await model.findById(req.params.id);
    if (!row) throw notFound(`${resourceLabel} not found`);
    res.json(row);
  }),
  store: asyncHandler(async (req, res) => {
    const row = await model.create(req.body || {});
    res.status(201).json(row);
  }),
  update: asyncHandler(async (req, res) => {
    const row = await model.update(req.params.id, req.body || {});
    if (!row) throw notFound(`${resourceLabel} not found`);
    res.json(row);
  }),
  destroy: asyncHandler(async (req, res) => {
    const ok = await model.delete(req.params.id);
    if (!ok) throw notFound(`${resourceLabel} not found`);
    res.json({ message: `${resourceLabel} deleted` });
  }),
});

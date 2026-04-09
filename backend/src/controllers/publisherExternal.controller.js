import externalPublisherService from "../library/services/externalPublisher.service.js";

export const index = async (req, res, next) => {
  try {
    const data = await externalPublisherService.index();
    return res.status(200).json({
      success: true,
      message: "Publishers fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const show = async (req, res, next) => {
  try {
    const data = await externalPublisherService.show(req.params.id);
    return res.status(200).json({
      success: true,
      message: "Publisher fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const store = async (req, res, next) => {
  try {
    const data = await externalPublisherService.store(req.body);
    return res.status(201).json({
      success: true,
      message: "Publisher created successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const data = await externalPublisherService.update(req.params.id, req.body);
    return res.status(200).json({
      success: true,
      message: "Publisher updated successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const destroy = async (req, res, next) => {
  try {
    const data = await externalPublisherService.destroy(req.params.id);
    return res.status(200).json({
      success: true,
      message: "Publisher deleted successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};
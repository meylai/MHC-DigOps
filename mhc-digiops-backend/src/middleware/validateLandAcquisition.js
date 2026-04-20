export const validateLandAcquisition = (req, res, next) => {
  const { formType, sellerName, region, landLocation, landSize, purpose } = req.body;

  const errors = [];

  if (!formType) errors.push("Form type is required");
  if (!sellerName) errors.push("Seller name is required");
  if (!region) errors.push("Region is required");
  if (!landLocation) errors.push("Land location is required");
  if (!landSize) errors.push("Land size is required");
  if (!purpose) errors.push("Purpose of purchase is required");

  if (errors.length > 0) {
    return res.status(400).json({ message: "Validation failed", errors });
  }

  next(); // continue to controller if all good
};

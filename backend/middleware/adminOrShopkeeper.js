const adminOrShopkeeper = (req, res, next) => {
  if (
    req.user.role !== "admin" &&
    req.user.role !== "shopkeeper"
  ) {
    return res.json({
      success: false,
      message: "Admin or Shopkeeper access only",
    });
  }
  next();
};

export default adminOrShopkeeper;

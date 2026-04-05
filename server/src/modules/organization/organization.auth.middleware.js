import jwt from "jsonwebtoken";

const orgAuth = async (req, res, next) => {
  const token = req.cookies.orgToken || req.headers["org-authorization"]?.split(" ")[1];

  if (!token) {
    return res.json({
      success: false,
      message: "Not authorized. Please login as organization.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.id || decoded.type !== "organization") {
      return res.json({
        success: false,
        message: "Invalid organization token.",
      });
    }

    req.organizationId = decoded.id;
    req.body.organizationId = decoded.id;
    next();
  } catch (error) {
    return res.json({ success: false, message: "Token expired or invalid." });
  }
};

export default orgAuth;

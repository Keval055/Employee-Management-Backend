const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }

  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Authentication failed!" });
    }

    const decodedToken = jwt.verify(token, "secret_secret");
    req.userData = { userId: decodedToken.userId };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Authentication failed!" });
  }
};

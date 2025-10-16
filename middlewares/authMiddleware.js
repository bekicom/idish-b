const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const auth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // req.user = await User.findById(decoded.id).select("-password");
      req.user = decoded


      next();
    } catch (error) {
      res.status(401).json({ message: "Token noto'g'ri, ruxsat yo'q" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Token yo'q, ruxsat yo'q" });
  }
};

module.exports = auth;

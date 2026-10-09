import User from "../models/userModel.js";
import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "authorization required" });
    }

    const decoded = jwt.verify(token, process.env.jwt_secret);

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User does not exist" });
    }

    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};

export default authMiddleware;

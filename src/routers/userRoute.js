import express from "express";
import {
  getMe,
  Login,
  logout,
  register,
} from "../controllers/authController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", register);

router.post("/login", Login);

router.get("/me", authMiddleware, getMe);

router.post("/logout", logout);

export default router;

import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/userModel.js";

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.jwt_secret, { expiresIn: "3d" });
};

export async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "fill in the above" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: "user already exist" });
    }

    const hashPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      password: hashPassword,
      role: role || "customer",
    });

    const token = generateToken(user._id);

    res.status(201).json({
      message: "registration successful",
      token: token,
      user: {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
}

// Login
export const Login = async (req, res, next) => {
  try {
    // 1. destructure
    const { email, password } = req.body;

    // 2. find user
    const user = await User.findOne({ email });

    // 3. validate user
    if (!user) {
      return res.status(404).json({ message: "invalid email or password" });
    }

    // 4. validate password
    const passwordMatch = await bcrypt.compare(password, user.password);

    // 5. if password does not match
    if (!passwordMatch) {
      return res.status(401).json({ message: "invalid email or password" });
    }

    // 6. asign jwt
    const token = generateToken(user._id);

    // 7. send response
    res.status(200).json({
      message: "login successful",
      token: token,
      user: {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      message: "user fetched successfully",
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    return res.status(200).json({ message: "logout successful" });
  } catch (error) {
    next(error);
  }
};

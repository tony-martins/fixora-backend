import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: [6, "password must be atleast 6 characters long"],
    },
    role: {
      type: String,
      default: "customer",
      enum: ["customer", "provider"],
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;

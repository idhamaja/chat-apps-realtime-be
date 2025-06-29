import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const signUp = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    // Validate all required fields
    if (!fullName || !email || !password) {
      return res.status(400).json({
        message:
          "Please provide all required fields: fullName, email, password",
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Please provide a valid email address",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    // Save user and generate token
    await newUser.save();
    generateToken(newUser._id, res);

    // Return user data (excluding password)
    const userResponse = {
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      profilePic: newUser.profilePic,
    };

    return res.status(201).json(userResponse);
  } catch (error) {
    console.error("Error in signUp controller:", error.message);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user?.password || ""
    );

    if (!user || !isPasswordCorrect) {
      return res
        .status(400)
        .json({ message: "Invalid email or password, Please Check Again.." });
    }

    generateToken(user._id, res);

    const userResponse = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    };

    return res.status(200).json(userResponse);
  } catch (error) {
    console.error("Error in login controller:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic)
      return res
        .status(400)
        .json({ message: "Profile picture is required!!!" });

    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        profilePic: uploadResponse.secure_url,
      },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("Error in update profile!!!", error);
  }
};

//CHECK AUTH
export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res
      .status(500)
      .json({ message: "Internal Server Error, Please Check Again!!" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller!!", error.message);
    return res.status(500).json({ message: "Internal Server Error Boss!!!" });
  }
};

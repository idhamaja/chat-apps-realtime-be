import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    //CHECK if there's Token or Not
    const token = req.cookies.jwt;

    if (!token)
      return res
        .status(401)
        .json({ message: "Unauthorized - Sorry, No Token Provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded)
      return res.status(401).json({ message: "Unauthorized - Invalid Token" });

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) return res.statu(404).json({ message: "User not found" });

    req.user = user;
    next();
  } catch (error) {
    console.log("Error in protectRoute middleware", error.message);
  }
};

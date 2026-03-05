import { Request, Response, Router } from "express";
import { response } from "../utils/responseHandler";
import User from "../models/User";
import { cacheDel } from "../utils/cache";

const router = Router();

/**
 * Edit User Profile by ID
 * Route: PUT /profile/:userId
 */
export const editUserProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params; // Extract userId from request parameters

    if (!userId) {
      return response(res, 400, "User ID is required.");
    }

    const { name, email, phoneNumber } = req.body;

    // Find the user by ID and update the profile fields
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, email, phoneNumber },
      { new: true, runValidators: true }
    ).select("-password -verificationToken -resetPasswordToken -resetPasswordExpires");

    if (!updatedUser) {
      return response(res, 404, "User not found.");
    }

    // Invalidate address/user cache since profile data is often denormalized
    await cacheDel(`address:${userId}`);

    return response(res, 200, "User profile updated successfully.", updatedUser);
  } catch (error) {
    return response(res, 500, "Internal server error.", error);
  }
};


export default router;

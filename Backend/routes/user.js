/**
 * @openapi
 * tags:
 *   - name: Users
 *     description: Operations related to user profiles
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     UserProfile:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: MongoDB ObjectId of the user
 *           example: "64f1a2b3c4d5e6f7g8h90123"
 *         name:
 *           type: string
 *           description: Full name of the user
 *           example: "Jane Doe"
 *         email:
 *           type: string
 *           description: Email address of the user
 *           example: "jane.doe@example.com"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Time when the user was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Time when the user profile was last updated
 */

import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import User from "../models/User.js";

const router = Router();

/**
 * @openapi
 * /api/profile:
 *   get:
 *     summary: Retrieve the current user's profile
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The authenticated user's profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: Unauthorized – missing or invalid JWT
 */
router.get("/profile", requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id).select("-googleId");
  res.json(user);
});

export default router;

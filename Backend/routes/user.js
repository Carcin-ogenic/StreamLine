import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import User from "../models/User.js";

const router = Router();

router.get("/profile", requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id).select("-googleId");
  res.json(user);
});

export default router;

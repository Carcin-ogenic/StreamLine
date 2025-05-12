import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import Customer from "../models/Customer.js";
import Segment from "../models/Segment.js";
import Campaign from "../models/Campaign.js";

const router = Router();

router.get("/dashboard-metrics", requireAuth, async (req, res, next) => {
  try {
    const totalCustomers = await Customer.countDocuments();
    const totalSegments = await Segment.countDocuments({ createdBy: req.user.id });
    const totalCampaigns = await Campaign.countDocuments({ createdBy: req.user.id });

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const uniqueIds = await Campaign.distinct("appliedTo", {
      createdBy: req.user.id,
      createdAt: { $gte: oneWeekAgo },
    });
    const reachLast7Days = uniqueIds.length;
    const recentSegments = await Segment.find({ createdBy: req.user.id })
      .sort("-createdAt")
      .limit(3)
      .select("name createdAt");

    const recentCampaigns = await Campaign.find({ createdBy: req.user.id })
      .sort("-createdAt")
      .limit(3)
      .select("name appliedTo createdAt");
    res.json({
      totalCustomers,
      totalSegments,
      totalCampaigns,
      reachLast7Days,
      recentSegments,
      recentCampaigns,
    });
  } catch (err) {
    next(err);
  }
});

export default router;

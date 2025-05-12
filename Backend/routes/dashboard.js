/**
 * @openapi
 * tags:
 *   - name: Dashboard
 *     description: Endpoints for retrieving dashboard metrics
 * components:
 *   schemas:
 *     RecentSegment:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "VIP Customers"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-05-10T14:23:00.000Z"
 *     RecentCampaign:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Spring Sale Blast"
 *         appliedTo:
 *           type: integer
 *           description: Number of customers the campaign was applied to
 *           example: 150
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-05-11T09:45:00.000Z"
 *     DashboardMetrics:
 *       type: object
 *       properties:
 *         totalCustomers:
 *           type: integer
 *           description: Total number of customers in the database
 *           example: 1024
 *         totalSegments:
 *           type: integer
 *           description: Total number of segments created by the current user
 *           example: 12
 *         totalCampaigns:
 *           type: integer
 *           description: Total number of campaigns created by the current user
 *           example: 34
 *         reachLast7Days:
 *           type: integer
 *           description: Unique customers reached by campaigns in the last 7 days
 *           example: 256
 *         recentSegments:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/RecentSegment'
 *         recentCampaigns:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/RecentCampaign'
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import Customer from "../models/Customer.js";
import Segment from "../models/Segment.js";
import Campaign from "../models/Campaign.js";

const router = Router();

/**
 * @openapi
 * /dashboard-metrics:
 *   get:
 *     summary: Retrieve key dashboard metrics for the current user
 *     tags:
 *       - Dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard metrics fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardMetrics'
 *       401:
 *         description: Unauthorized – missing or invalid JWT
 */
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

/**
 * @openapi
 * tags:
 *   - name: Campaigns
 *     description: Endpoints to manage campaigns and generate AI suggestions
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     SuggestRequest:
 *       type: object
 *       required:
 *         - goal
 *       properties:
 *         goal:
 *           type: string
 *           description: Campaign goal for which to generate message variants
 *           example: "Increase Spring sale conversion"
 *     SuggestResponse:
 *       type: object
 *       properties:
 *         suggestions:
 *           type: array
 *           items:
 *             type: string
 *           description: Generated message variants
 *           example:
 *             - "Spring is here—enjoy 25% off our new collection!"
 *             - "Fresh styles await! Save 25% this week only."
 *             - "Spring refresh: get 25% off all new arrivals."
 *     CreateCampaignRequest:
 *       type: object
 *       required:
 *         - name
 *         - segmentId
 *         - message
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the campaign
 *           example: "VIP Spring Offer"
 *         segmentId:
 *           type: string
 *           description: MongoDB ObjectId of the target segment
 *           example: "SEGMENT_ID_FOR_VIP"
 *         message:
 *           type: string
 *           description: Message template for the campaign
 *           example: "Hey VIP! Enjoy 25% off on our new arrivals this Spring."
 *     Campaign:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         segmentId:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *         appliedTo:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *         createdBy:
 *           type: string
 *         message:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import Segment from "../models/Segment.js";
import Campaign from "../models/Campaign.js";
import Customer from "../models/Customer.js";
import { buildMongoFilter } from "../utils/queryBuilderToMongo.js";
import Groq from "groq-sdk";

const router = Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

function extractJson(text) {
  let cleaned = text.replace(/```(?:json)?/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("No JSON object found in LLM response");
  }
  return cleaned.slice(start, end + 1);
}

/**
 * @openapi
 * /campaigns/suggest:
 *   post:
 *     summary: Generate 3 campaign message suggestions using Llama model
 *     tags:
 *       - Campaigns
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SuggestRequest'
 *     responses:
 *       200:
 *         description: An array of suggested messages
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuggestResponse'
 *       401:
 *         description: Unauthorized
 */
router.post("/suggest", requireAuth, async (req, res, next) => {
  try {
    const { goal } = req.body;
    const prompt = `
You are a marketing assistant. Given the campaign goal, generate 3 concise email message variants.
Goal: "${goal}"
Return JSON: { "suggestions": ["…", "…", "…"] }
`;
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
    });
    const text = completion.choices[0].message.content.trim();
    const jsonText = extractJson(text);
    const { suggestions } = JSON.parse(jsonText);
    res.json({ suggestions });
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /campaigns:
 *   post:
 *     summary: Create a new campaign
 *     tags:
 *       - Campaigns
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCampaignRequest'
 *     responses:
 *       201:
 *         description: Campaign created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Campaign'
 *       404:
 *         description: Segment not found
 *       401:
 *         description: Unauthorized
 */
router.post("/", requireAuth, async (req, res, next) => {
  try {
    const { name, segmentId, message } = req.body;
    const segment = await Segment.findById(segmentId);
    if (!segment) return res.status(404).json({ message: "Segment not found" });

    const filter = buildMongoFilter(segment.query);
    const customers = await Customer.find(filter).select("_id");

    const campaign = await Campaign.create({
      name,
      segmentId,
      appliedTo: customers.map((c) => c._id),
      createdBy: req.user.id,
      message,
    });
    res.status(201).json(campaign);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /campaigns:
 *   get:
 *     summary: Get all campaigns for current user
 *     tags:
 *       - Campaigns
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of campaigns
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Campaign'
 *       401:
 *         description: Unauthorized
 */
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const campaigns = await Campaign.find({ createdBy: req.user.id }).populate("segmentId", "name").sort("-createdAt");
    res.json(campaigns);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /campaigns/{id}:
 *   get:
 *     summary: Get a single campaign by ID
 *     tags:
 *       - Campaigns
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the campaign
 *     responses:
 *       200:
 *         description: Campaign data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Campaign'
 *       404:
 *         description: Campaign not found
 *       401:
 *         description: Unauthorized
 */
router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate("segmentId", "name")
      .populate("appliedTo", "name email");
    if (!campaign) return res.status(404).json({ message: "Campaign not found" });
    res.json(campaign);
  } catch (err) {
    next(err);
  }
});

export default router;

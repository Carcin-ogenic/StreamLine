/**
 * @openapi
 * tags:
 *   - name: Segments
 *     description: Endpoints for building, parsing, previewing, and managing customer segments
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Rule:
 *       type: object
 *       properties:
 *         field:
 *           type: string
 *           description: Field name to filter on (e.g. totalSpend, lastVisit, tags)
 *           example: "totalSpend"
 *         operator:
 *           type: string
 *           description: Comparison operator
 *           enum:
 *             - "="
 *             - "!="
 *             - "<"
 *             - "<="
 *             - ">"
 *             - ">="
 *             - "contains"
 *             - "doesNotContain"
 *           example: ">"
 *         value:
 *           type: string
 *           description: Value to compare against (numbers and dates are strings here)
 *           example: "100"
 *     Query:
 *       type: object
 *       properties:
 *         combinator:
 *           type: string
 *           description: Logical operator between rules
 *           enum:
 *             - "and"
 *             - "or"
 *           example: "and"
 *         rules:
 *           type: array
 *           description: Array of field-based rules
 *           items:
 *             $ref: '#/components/schemas/Rule'
 *     Segment:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "64f1d2e3a4b5c6d7e8f90123"
 *         name:
 *           type: string
 *           example: "High Spend Customers"
 *         query:
 *           $ref: '#/components/schemas/Query'
 *         createdBy:
 *           type: string
 *           description: ID of the user who created the segment
 *           example: "64f1a2b3c4d5e6f7g8h90123"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     PreviewResponse:
 *       type: object
 *       properties:
 *         count:
 *           type: integer
 *           description: Number of customers matching the filter
 *           example: 42
 *     ParseNlRequest:
 *       type: object
 *       required:
 *         - text
 *       properties:
 *         text:
 *           type: string
 *           description: Natural language description of the segment
 *           example: "Customers who spent over 100 and tagged with vip"
 *     ParseNlResponse:
 *       type: object
 *       properties:
 *         query:
 *           $ref: '#/components/schemas/Query'
 *     CreateSegmentRequest:
 *       type: object
 *       required:
 *         - name
 *         - query
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the segment
 *           example: "Recent Visitors"
 *         query:
 *           $ref: '#/components/schemas/Query'
 */

import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import Customer from "../models/Customer.js";
import Segment from "../models/Segment.js";
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
 * /api/segments/preview:
 *   post:
 *     summary: Preview segment match count without saving
 *     tags:
 *       - Segments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Filter object following Query schema
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Query'
 *     responses:
 *       200:
 *         description: Count of customers matching the segment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PreviewResponse'
 *       401:
 *         description: Unauthorized
 */
router.post("/preview", requireAuth, async (req, res, next) => {
  try {
    const filter = buildMongoFilter(req.body);
    const count = await Customer.countDocuments(filter);
    res.json({ count });
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /api/segments/parse-nl:
 *   post:
 *     summary: Parse natural language into segment query JSON
 *     tags:
 *       - Segments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ParseNlRequest'
 *     responses:
 *       200:
 *         description: Parsed query object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ParseNlResponse'
 *       401:
 *         description: Unauthorized
 */
router.post("/parse-nl", requireAuth, async (req, res, next) => {
  try {
    const { text } = req.body;
    const prompt = `
You are a query builder translator. Fields: totalSpend (number), lastVisit (date), tags (string).
Operators: =, !=, <, <=, >, >=, contains, doesNotContain.
Convert this description into JSON: {"combinator": "...", "rules":[{…}]}
Description: "${text}"
Reply with only valid JSON.
`;
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
    });
    const json = completion.choices[0].message.content.trim();
    const jsonText = extractJson(json);
    const query = JSON.parse(jsonText);
    res.json({ query });
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /api/segments:
 *   post:
 *     summary: Create and save a new segment
 *     tags:
 *       - Segments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSegmentRequest'
 *     responses:
 *       201:
 *         description: Segment created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Segment'
 *       401:
 *         description: Unauthorized
 */
router.post("/", requireAuth, async (req, res, next) => {
  try {
    const segment = await Segment.create({
      name: req.body.name,
      query: req.body.query,
      createdBy: req.user.id,
    });
    res.status(201).json(segment);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /api/segments:
 *   get:
 *     summary: List all segments for the current user
 *     tags:
 *       - Segments
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of saved segments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Segment'
 *       401:
 *         description: Unauthorized
 */
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const segments = await Segment.find({ createdBy: req.user.id }).sort("-createdAt");
    res.json(segments);
  } catch (err) {
    next(err);
  }
});

export default router;

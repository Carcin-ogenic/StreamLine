/**
 * @openapi
 * tags:
 *   - name: Customers
 *     description: CRUD operations for customer resource
 * components:
 *   schemas:
 *     Customer:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: MongoDB ObjectId
 *           example: "64f1b9a8e1f2c3d456789012"
 *         name:
 *           type: string
 *           example: "Jane Doe"
 *         email:
 *           type: string
 *           example: "jane.doe@example.com"
 *         totalSpend:
 *           type: number
 *           example: 1234.56
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           example: ["vip", "newsletter"]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CreateCustomerRequest:
 *       type: object
 *       required:
 *         - name
 *         - email
 *       properties:
 *         name:
 *           type: string
 *           description: Customer's full name
 *           example: "Jane Doe"
 *         email:
 *           type: string
 *           description: Customer's email address
 *           example: "jane.doe@example.com"
 *         totalSpend:
 *           type: number
 *           description: Total spend amount
 *           example: 0
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of tag strings
 *           example: ["new", "trial"]
 *     UpdateCustomerRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         totalSpend:
 *           type: number
 *         tags:
 *           type: array
 *           items:
 *             type: string
 */

import { Router } from "express";
import { body, query, param } from "express-validator";
import {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} from "../controllers/customerController.js";
import { validateRequest } from "../middleware/validate.js";

const router = Router();

/**
 * @openapi
 * /api/customers:
 *   post:
 *     summary: Create a new customer
 *     tags:
 *       - Customers
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCustomerRequest'
 *     responses:
 *       201:
 *         description: Customer created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       400:
 *         description: Invalid request data
 */
router.post(
  "/",
  [
    body("name").notEmpty(),
    body("email").isEmail(),
    body("totalSpend").optional().isFloat({ min: 0 }),
    body("tags").optional().isArray(),
  ],
  validateRequest,
  createCustomer
);

/**
 * @openapi
 * /api/customers:
 *   get:
 *     summary: Retrieve a paginated list of customers
 *     tags:
 *       - Customers
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Number of items per page
 *       - in: query
 *         name: minSpend
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Minimum totalSpend filter
 *     responses:
 *       200:
 *         description: List of customers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Customer'
 *       400:
 *         description: Invalid query parameters
 */
router.get(
  "/",
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1 }),
    query("minSpend").optional().isFloat({ min: 0 }),
  ],
  validateRequest,
  getCustomers
);

/**
 * @openapi
 * /api/customers/{id}:
 *   get:
 *     summary: Get a single customer by ID
 *     tags:
 *       - Customers
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of customer
 *     responses:
 *       200:
 *         description: Customer found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       400:
 *         description: Invalid ID format
 *       404:
 *         description: Customer not found
 */
router.get("/:id", param("id").isMongoId(), validateRequest, getCustomerById);

/**
 * @openapi
 * /api/customers/{id}:
 *   put:
 *     summary: Update an existing customer
 *     tags:
 *       - Customers
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of customer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCustomerRequest'
 *     responses:
 *       200:
 *         description: Customer updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Customer not found
 */
router.put(
  "/:id",
  [param("id").isMongoId(), body("email").optional().isEmail(), body("totalSpend").optional().isFloat({ min: 0 })],
  validateRequest,
  updateCustomer
);

/**
 * @openapi
 * /api/customers/{id}:
 *   delete:
 *     summary: Delete a customer by ID
 *     tags:
 *       - Customers
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of customer
 *     responses:
 *       204:
 *         description: Customer deleted successfully (no content)
 *       400:
 *         description: Invalid ID format
 *       404:
 *         description: Customer not found
 */
router.delete("/:id", param("id").isMongoId(), validateRequest, deleteCustomer);

export default router;

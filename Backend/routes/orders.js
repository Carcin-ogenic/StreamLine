/**
 * @openapi
 * tags:
 *   - name: Orders
 *     description: CRUD operations for order resource
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "64f1c2d3e4a5b6c7d8e9f012"
 *         customer:
 *           type: string
 *           description: MongoDB ObjectId of the customer who placed the order
 *           example: "64f1b9a8e1f2c3d456789012"
 *         amount:
 *           type: number
 *           description: Total order amount
 *           example: 199.99
 *         items:
 *           type: array
 *           description: List of items in the order
 *           items:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *                 example: "64f1a2b3c4d5e6f7g8h9i012"
 *               quantity:
 *                 type: integer
 *                 example: 2
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CreateOrderRequest:
 *       type: object
 *       required:
 *         - customer
 *         - amount
 *         - items
 *       properties:
 *         customer:
 *           type: string
 *           description: MongoDB ObjectId of the customer
 *           example: "64f1b9a8e1f2c3d456789012"
 *         amount:
 *           type: number
 *           description: Total order amount
 *           example: 199.99
 *         items:
 *           type: array
 *           description: Array of order items
 *           items:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *     UpdateOrderRequest:
 *       type: object
 *       properties:
 *         amount:
 *           type: number
 *           description: Updated total order amount
 *           example: 149.99
 *         items:
 *           type: array
 *           description: Updated list of order items
 *           items:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: integer
 */

import { Router } from "express";
import { body, query, param } from "express-validator";
import { createOrder, getOrders, getOrderById, updateOrder, deleteOrder } from "../controllers/orderController.js";
import { validateRequest } from "../middleware/validate.js";

const router = Router();

/**
 * @openapi
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     tags:
 *       - Orders
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrderRequest'
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid request data
 */
router.post(
  "/",
  [body("customer").isMongoId(), body("amount").isFloat({ min: 0 }), body("items").isArray({ min: 1 })],
  validateRequest,
  createOrder
);

/**
 * @openapi
 * /api/orders:
 *   get:
 *     summary: Retrieve a list of orders with optional pagination and filtering
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Number of orders per page
 *       - in: query
 *         name: customerId
 *         schema:
 *           type: string
 *         description: Filter orders by customer ObjectId
 *     responses:
 *       200:
 *         description: List of orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid query parameters
 */
router.get(
  "/",
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1 }),
    query("customerId").optional().isMongoId(),
  ],
  validateRequest,
  getOrders
);

/**
 * @openapi
 * /api/orders/{id}:
 *   get:
 *     summary: Get a single order by ID
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the order
 *     responses:
 *       200:
 *         description: Order data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid ID format
 *       404:
 *         description: Order not found
 */
router.get("/:id", param("id").isMongoId(), validateRequest, getOrderById);

/**
 * @openapi
 * /api/orders/{id}:
 *   put:
 *     summary: Update an existing order
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the order
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateOrderRequest'
 *     responses:
 *       200:
 *         description: Order updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Order not found
 */
router.put(
  "/:id",
  [
    param("id").isMongoId(),
    body("amount").optional().isFloat({ min: 0 }),
    body("items").optional().isArray({ min: 1 }),
  ],
  validateRequest,
  updateOrder
);

/**
 * @openapi
 * /api/orders/{id}:
 *   delete:
 *     summary: Delete an order by ID
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the order
 *     responses:
 *       204:
 *         description: Order deleted successfully (no content)
 *       400:
 *         description: Invalid ID format
 *       404:
 *         description: Order not found
 */
router.delete("/:id", param("id").isMongoId(), validateRequest, deleteOrder);

export default router;

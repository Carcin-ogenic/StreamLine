import { Router } from "express";
import { body, query, param } from "express-validator";
import { createOrder, getOrders, getOrderById, updateOrder, deleteOrder } from "../controllers/orderController.js";
import { validateRequest } from "../middleware/validate.js";

const router = Router();

router.post(
  "/",
  [body("customer").isMongoId(), body("amount").isFloat({ min: 0 }), body("items").isArray({ min: 1 })],
  validateRequest,
  createOrder
);

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

router.get("/:id", param("id").isMongoId(), validateRequest, getOrderById);

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

router.delete("/:id", param("id").isMongoId(), validateRequest, deleteOrder);

export default router;

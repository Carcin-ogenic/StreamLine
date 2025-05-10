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

// POST /api/customers
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

// GET /api/customers
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

// GET /api/customers/:id
router.get("/:id", param("id").isMongoId(), validateRequest, getCustomerById);

// PUT /api/customers/:id
router.put(
  "/:id",
  [param("id").isMongoId(), body("email").optional().isEmail(), body("totalSpend").optional().isFloat({ min: 0 })],
  validateRequest,
  updateCustomer
);

// DELETE /api/customers/:id
router.delete("/:id", param("id").isMongoId(), validateRequest, deleteCustomer);

export default router;

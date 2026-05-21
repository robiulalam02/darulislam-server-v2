const express = require("express");
const router = express.Router();
const {
  placeOrder,
  getPendingOrders,
} = require("../controllers/orderController");
const { protect, admin } = require("../middlewares/authMiddleware");

// cutomer order post api
router.post("/checkout", protect, placeOrder);

// admin pending orders get api
router.get("/admin/pending", protect, admin, getPendingOrders);

module.exports = router;

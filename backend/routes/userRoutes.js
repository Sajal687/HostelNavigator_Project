const express = require("express");
const {
  getAllUsers,
  getUserById,
  getUserByAuthUserId,
  createUser,
  login,
  updateUserById,
  deleteUserById,
} = require("../controllers/userController");
const { authenticate, requireRole, requireSelf } = require("../middleware/auth");

const router = express.Router();

// Public routes
router.post('/login', login);
router.post('/register', createUser);

// Protected routes
// Listing every user is reserved for the admin role (introduced in Phase 7).
router.get("/users", authenticate, requireRole("admin"), getAllUsers);
router.get("/users/:id", authenticate, requireSelf("id"), getUserById);
router.get('/users/authuser/:id', authenticate , getUserByAuthUserId);
router.put("/users/:id", authenticate, requireSelf("id"), updateUserById);
router.delete("/users/:_id", authenticate, requireSelf("_id"), deleteUserById);

module.exports = router;

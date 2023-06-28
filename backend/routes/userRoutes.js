const express = require("express");
const {
  getAllUsers,
  getUserById,
  getUserByAuthUserId,
  createUser,
  login,
  authenticate,
  updateUserById,
  deleteUserById,
} = require("../controllers/userController");

const router = express(express.Router());

// Public routes
router.post('/login', login);
router.post('/register', createUser);

// Protected routes
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.get('/users/authuser/:id', authenticate , getUserByAuthUserId);
router.put("/users/:id",authenticate , updateUserById);
router.delete("/users/:_id", authenticate , deleteUserById);

module.exports = router;

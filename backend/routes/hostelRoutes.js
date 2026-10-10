const express = require("express");
const {
  getPostalCodeDetails,
  getAllHostel,
  searchHostels,
  getPublicHostel,
  getHostelById,
  uploadImage,
  createHostel,
  updateHostel,
 deleteHostelById,
} = require("../controllers/hostelController");
const { authenticate, requireRole, requireSelf } = require("../middleware/auth");

const router = express.Router();

// Proxies the RapidAPI PIN code lookup so the API key never reaches the browser.
router.get('/api/postal-code/:pincode', getPostalCodeDetails);
// /search must be registered before /:id.
router.get("/api/hostels/search", searchHostels);
router.get("/api/hostels/:id", getPublicHostel);
router.get("/hostels", getAllHostel);
router.get("/hostels/:id", getHostelById);
// Public: this is the owner sign-up flow, which creates the owner account and hostel together.
router.post("/hostels", uploadImage , createHostel);
router.put("/hostels/:id", authenticate, requireRole("hostelOwner"), requireSelf("id"), updateHostel);
router.delete("/hostels/:id", authenticate, requireRole("hostelOwner"), requireSelf("id"), deleteHostelById);

module.exports = router;

const express = require("express");
const {
  getPostalCodeApiKey,
  getAllHostel,
  getHostelById,
  uploadImage,
  createHostel,
  updateHostel,
 deleteHostelById,
} = require("../controllers/hostelController");

const router = express(express.Router());

router.get('/api',getPostalCodeApiKey);
router.get("/hostels", getAllHostel);
router.get("/hostels/:id", getHostelById);
router.post("/hostels", uploadImage , createHostel);
router.put("/hostels/:id", updateHostel);
router.delete("/hostels/:id",deleteHostelById);

module.exports = router;
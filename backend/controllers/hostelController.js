const { Hostel } = require("../models/hostelModel");
const {AuthUser} = require("../models/authuserModel");
const {Role} = require("../models/roleModel");
const { signToken } = require("../middleware/auth");
const {
  SearchParamError,
  parseSearchParams,
  buildSearchPipeline,
  formatSearchResult,
} = require("../services/hostelSearch");

const multer = require("multer");

// Render's filesystem is ephemeral, so uploads are kept in memory and never written to disk.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB file size limit
  },
  fileFilter: function (req, file, cb) {
    if (/^image\/(jpeg|png|webp)$/.test(file.mimetype)) {
      return cb(null, true);
    }
    return cb(new Error("Only JPEG, PNG or WebP images are allowed"));
  },
}).array("hostel_images",5);

const uploadImage = (req, res, next) => {
  upload(req, res, function (err) {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

const POSTALCODE_API_URL = "https://get-details-by-pin-code-india.p.rapidapi.com/detailsbypincode";

const getPostalCodeDetails = async (req, res) => {
  const { pincode } = req.params;
  if (!/^\d{6}$/.test(pincode)) {
    return res.status(400).json({ message: "PIN code must be 6 digits" });
  }
  if (!process.env.POSTALCODE_API_KEY) {
    return res.status(503).json({ message: "PIN code lookup is not configured" });
  }

  try {
    const response = await fetch(POSTALCODE_API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "X-RapidAPI-Key": process.env.POSTALCODE_API_KEY,
        "X-RapidAPI-Host": "get-details-by-pin-code-india.p.rapidapi.com",
      },
      body: JSON.stringify({ pincode }),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) {
      console.log(`PIN code lookup failed with status ${response.status}`);
      return res.status(502).json({ message: "PIN code lookup failed" });
    }
    const result = await response.json();
    res.status(200).json({ message: "PIN code details found", data: result.details || [] });
  } catch (error) {
    console.log(`PIN code lookup error: ${error.message}`);
    res.status(502).json({ message: "PIN code lookup failed" });
  }
};

const getAllHostel = async (req, res) => {
  try {
    const data = await Hostel.find();
    res.status(200).json({ message: "Data Find Successfully", data: data });
  } catch (err) {
    console.log("Something Went Wrong");
    res.status(500).json({ message: "Something Went Wrong" });
  }
};

// GET /api/hostels/search - filters, text search, radius search, sorting and pagination.
const searchHostels = async (req, res) => {
  try {
    const params = parseSearchParams(req.query);
    const [result] = await Hostel.aggregate(buildSearchPipeline(params));
    const total = result.total[0]?.count || 0;
    res.status(200).json({
      message: "Search results",
      data: result.data.map(formatSearchResult),
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit),
      },
    });
  } catch (error) {
    if (error instanceof SearchParamError) {
      return res.status(400).json({ message: error.message });
    }
    console.log(`Search failed: ${error.message}`);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// GET /api/hostels/:id - public detail view: published listings only, images as
// base64 strings, internal fields hidden. (GET /hostels/:id remains for the owner dashboard.)
const getPublicHostel = async (req, res) => {
  try {
    const hostel = await Hostel.findOne({ _id: req.params.id, status: { $in: ["published", null] } })
      .select("-authUser -all_users -ai_summary")
      .lean();
    if (!hostel) {
      return res.status(404).json({ message: "Hostel not found" });
    }
    res.status(200).json({ message: "Hostel found", data: formatSearchResult(hostel, { maxImages: 5 }) });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({ message: "Hostel not found" });
    }
    console.log(`Public hostel fetch failed: ${error.message}`);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const getHostelById = async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id);
    const data = await Hostel.findById(id);
    if (!data) {
      return res.status(404).json({ message: "Hostel not found" });
    }
    res.status(200).json({ message: "Data find Successfully", data: data });
  } catch {
    console.log("Something Went Wrong");
    res.status(500).json({ message: "Something Went Wrong" });
  }
};


const createHostel = async (req, res) => {
  try {
    const {
      hostel_name,
      hostel_gender_type,
      hostel_rent,
      owner_name,
      owner_phone_number,
      owner_email,
      password,
    } = req.body;
    
    const hostel_facilities = req.body.hostel_facilities || [];


    const { hostel_address, hostel_rooms } = req.body;
    const parsedHostelAddress = JSON.parse(hostel_address);
    const parsedRoomDetail = JSON.parse(hostel_rooms);

    // Ratings come from student reviews, never from the owner.
    const hostel_rating = 0;

    // Optional coordinates for radius search; stored as GeoJSON [longitude, latitude].
    const latitude = parseFloat(req.body.latitude);
    const longitude = parseFloat(req.body.longitude);
    const location =
      Number.isFinite(latitude) && Number.isFinite(longitude)
        ? { type: "Point", coordinates: [longitude, latitude] }
        : undefined;
    const hostel_images = req.files ? req.files : [];

    if (
      !hostel_name ||
      !hostel_address ||
      !hostel_gender_type ||
      !hostel_rent ||
      !hostel_facilities.length ||
      !hostel_images.length ||
      !owner_name ||
      !owner_phone_number ||
      !owner_email ||
      typeof password !== "string" ||
      password.length < 6
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existingHostel = await Hostel.findOne({
      $and: [
        { hostel_name: hostel_name },
        { owner_name: owner_name },
        { owner_phone_number: owner_phone_number },
      ],
    });

    if (existingHostel) {
      return res.status(409).json({ message: "Hostel is already present" });
    }

    let idGenerator = await Hostel.countDocuments({});
    idGenerator++;
    const hostel_id = idGenerator.toString();

    const hostelImg = hostel_images.map((image) => ({
      data: image.buffer,
      contentType: image.mimetype,
    }));


    const roleName = "hostelOwner";
    const newUserRole = new Role({
      rolename: roleName,
    });
    await newUserRole.save();

    const newHostelOwnerAuth = new AuthUser({
      useremail: owner_email,
      password,
      role: newUserRole._id,
    })
    await newHostelOwnerAuth.save();

    const newHostel = new Hostel({
      authUser: newHostelOwnerAuth._id,
      hostel_id,
      hostel_name,
      hostel_address: parsedHostelAddress,
      location,
      hostel_gender_type,
      hostel_rent,
      hostel_facilities,
      hostel_rating,
      hostel_img: hostelImg,
      owner_name,
      owner_phone_number,
      owner_email,
      hostel_rooms: parsedRoomDetail,
      description: typeof req.body.description === "string" ? req.body.description : undefined,
      house_rules: typeof req.body.house_rules === "string" ? req.body.house_rules : undefined,
    });
    await newHostel.save();

    const token = signToken({ id: newHostel._id, userName: owner_name, userType: "hostelOwner" });
    res
      .status(201)
      .json({ message: "Hostel Added Successfully", token : token , userType: "hostelOwner" });
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }
    res.status(400).json({ message: "Something went wrong" });
  }
};



const updateHostel = async (req, res, next) => {
  try {
    const hostel_id = req.params.id;
    const {
      hostel_name,
      hostel_address,
      hostel_gender_type,
      hostel_rent,
      hostel_facilities,
      owner_name,
      owner_phone_number,
      owner_email,
      description,
      house_rules,
      status,
      has_vacancy,
    } = req.body;

    if (has_vacancy !== undefined && typeof has_vacancy !== "boolean") {
      return res.status(400).json({ message: "has_vacancy must be true or false" });
    }

    // Owners can't set hostel_rating (it will come from reviews) and images are
    // managed through the upload flow, not this JSON endpoint.
    const update = {
      hostel_name,
      hostel_address,
      hostel_gender_type,
      hostel_rent,
      hostel_facilities,
      owner_name,
      owner_phone_number,
      owner_email,
      description,
      house_rules,
      status,
      has_vacancy,
    };

    if (req.body.latitude !== undefined || req.body.longitude !== undefined) {
      const latitude = Number(req.body.latitude);
      const longitude = Number(req.body.longitude);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return res.status(400).json({ message: "latitude and longitude must both be numbers" });
      }
      update.location = { type: "Point", coordinates: [longitude, latitude] };
    }

    const updateResult = await Hostel.findByIdAndUpdate(hostel_id, update, {
      new: true,
      runValidators: true,
      projection: { hostel_img: 0, all_users: 0 },
    });

    if (!updateResult) {
      return res.status(404).json({ message: "Hostel not found" });
    }

    res
      .status(200)
      .json({ message: "Record Update Successfully", data: updateResult });
  } catch (err) {
    if (err.name === "ValidationError" || err.name === "CastError") {
      return res.status(400).json({ message: err.message });
    }
    console.error(`Hostel update failed: ${err.message}`);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const deleteHostelById = async (req, res, next) => {
  try {
    const id = req.params.id;

    const deletedHostel = await Hostel.findByIdAndDelete(id);

    if (!deletedHostel) {
      return res.status(404).json({ message: "Hostel not found" });
    }
    res.status(200).json({ message: "Hostel Deleted", data: deletedHostel });
  } catch (error) {
    console.log(`Something went wrong ${error}`);
    res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = {
  uploadImage,
  getPostalCodeDetails,
  getAllHostel,
  searchHostels,
  getPublicHostel,
  getHostelById,
  createHostel,
  updateHostel,
  deleteHostelById,
};

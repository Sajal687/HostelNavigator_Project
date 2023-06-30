const { Hostel } = require("../models/hostelModel");
const {AuthUser} = require("../models/authuserModel");
const {Role} = require("../models/roleModel");
const jwt = require('jsonwebtoken');

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const Storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = file.originalname.split('.').pop();
    cb(null, `${file.fieldname}-${uniqueSuffix}.${fileExtension}`);
    // cb(null, file.originalname);
  },
});

const upload = multer({
  storage: Storage,
  // limits: {
  //   fileSize: 1024 * 1024 * 5, // 5MB file size limit
  // },
  // fileFilter: function (req, file, cb) {
  //   const fileTypes = /jpeg|jpg|png/;
  //   const mimetype = fileTypes.test(file.mimetype);
  //   const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  //   if (mimetype && extname) {
  //     return cb(null, true);
  //   } else {
  //     return cb("Error: Images only");
  //   }
  // },
}).array("hostel_images",5);

const uploadImage = (req, res, next) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: err });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

const getPostalCodeApiKey = (req , res) => {
  try{
    const data = process.env.POSTALCODE_API_KEY;
    res.status(200).json({data:data});
  }catch(error){
    res.status(500).json({ message: "Something Went Wrong" });
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

    const hostel_rating = req.body.hostel_rating || 0;
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
      !owner_email
    ) {
      return res.status(500).json({ message: "Missing required fields" });
    }

    const existingHostel = await Hostel.findOne({
      $and: [
        { hostel_name: hostel_name },
        { owner_name: owner_name },
        { owner_phone_number: owner_phone_number },
      ],
    });

    if (existingHostel) {
      return res.status(500).json({ message: "Hostel is already present" });
    }

    let idGenerator = await Hostel.countDocuments({});
    idGenerator++;
    const hostel_id = idGenerator.toString();

    const hostelImg = [];
    hostel_images.forEach((image) => {
      hostelImg.push({
        data: fs.readFileSync(path.join(__dirname, "uploads", image.filename)),
        contentType: image.mimetype,
      });
    });


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
      hostel_gender_type,
      hostel_rent,
      hostel_facilities,
      hostel_rating,
      hostel_img: hostelImg,
      owner_name,
      owner_phone_number,
      owner_email,
      hostel_rooms: parsedRoomDetail, 
    });
    await newHostel.save();

    const token = jwt.sign({ id: newHostel._id , userName:owner_name , userType: "hostelOwner"}, 'your-secret-key', { expiresIn: '24h' });  
    res
      .status(201)
      .json({ message: "Hostel Added Successfully", token : token , userType: "hostelOwner" });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Something went wrong" , error:err});
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
      hostel_rating,
      owner_name,
      owner_phone_number,
      owner_email,
    } = req.body;

    if (req.body.image) {
      const hostel_img = req.body.image;
    }

    const updateResult = await Hostel.findByIdAndUpdate(
      hostel_id,
      {
        hostel_name,
        hostel_address,
        hostel_gender_type,
        hostel_rent,
        hostel_facilities,
        hostel_rating,
        hostel_img,
        owner_name,
        owner_phone_number,
        owner_email,
      },
      { new: true, upsert: true }
    );

    console.log(updateResult);

    res
      .status(201)
      .json({ message: "Record Update Successfully", data: updateResult });
  } catch (err) {
    console.error("Something went Wrong");
    res.status(500).json({ message: "Something went wrong" });
  }
};

const deleteHostelById = async (req, res, next) => {
  try {
    const id = req.params.id;

    const deletedHostel = await Hostel.findByIdAndDelete(id);

    if (!deletedHostel) {
      console.log(`User not Found`);
      return res.status(500).json({ message: "User not Found" });
    }
    res.status(201).json({ messgae: "User Deleted", data: deletedHostel });
  } catch (error) {
    console.log(`Something went wrong ${error}`);
    res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = {
  uploadImage,
  getPostalCodeApiKey,
  getAllHostel,
  getHostelById,
  createHostel,
  updateHostel,
  deleteHostelById,
};

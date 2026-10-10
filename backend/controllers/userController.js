const bcrypt = require('bcrypt');
const { signToken } = require("../middleware/auth");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;

const UserSchema = require("../models/userModel");
const User = UserSchema.User;
const AuthUserSchema = require("../models/authuserModel");
const AuthUser = AuthUserSchema.AuthUser;
const RoleSchema = require("../models/roleModel");
const Role = RoleSchema.Role;
const HostelSchema = require("../models/hostelModel");
const Hostel = HostelSchema.Hostel;

const getAllUsers = async (req, res) => {
  try {
    const data = await User.find();
    res
      .status(201)
      .json({ message: "All Users fetched Successfully", data: data });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

const getUserById = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await User.findById(id);
    console.log(id)

    if (!data) {
      return res.status(404).json({ message: "User Not Found" });
    }

    res.status(200).json({ message: "Users fetched Successfully", data: data });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const getUserByAuthUserId = async (req , res) => {
   try {
      const userId = req.user.id;
      const user = await User.findOne({ authUser: userId });
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.status(200).json({ user });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Something went wrong' });
    }
  }

const createUser = async (req, res) => {
  try {
    const { email_address, password, name, gender, phone_number } =
      req.body;

    if (!isNonEmptyString(email_address) || !EMAIL_REGEX.test(email_address)) {
      return res.status(400).json({ message: "A valid email address is required" });
    }
    if (!isNonEmptyString(password) || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    if (!isNonEmptyString(name) || !isNonEmptyString(phone_number)) {
      return res.status(400).json({ message: "Name and phone number are required" });
    }

    // Check if the useremail already exists in the AuthUser collection
    const existingAuthUser = await AuthUser.findOne({ useremail: email_address });
    if (existingAuthUser) {
      return res.status(409).json({ message: "Username already exists" });
    }

    // Create a new AuthUser documentt

    const roleName = "hostelUser";
    const newUserRole = new Role({
      rolename:roleName,
    });
    await newUserRole.save();

    const newAuthUser = new AuthUser({
      useremail: email_address,
      password, 
      role: newUserRole._id,
    });
    await newAuthUser.save();

    // Create a new User document with a reference to the AuthUser document
    const newUser = new User({
      authUser: newAuthUser._id,
      name,
      gender,
      phone_number,
      email_address,
    });
    await newUser.save();

    const token = signToken({ id: newUser._id, userName: name, userType: "hostelUser" });
    res.status(201).json({ message: "User Created Successfully" , token : token , userType: "hostelUser" });
  } catch (error) {
    console.log(error);
    if (error.code === 11000) {
      return res.status(409).json({ message: "Email or phone number already registered" });
    }
    res.status(500).json({ message: "Something went wrong" });
  }
};

const login = async (req, res) => {
  try {
    const { useremail, password } = req.body;

    // Reject non-string input so query operators (e.g. { "$ne": null }) can't reach Mongo.
    if (!isNonEmptyString(useremail) || !isNonEmptyString(password)) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find the AuthUser document based on the useremail
    const authUser = await AuthUser.findOne({ useremail });

    if (!authUser) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const id = authUser.role;
    const roleName = await Role.findById({_id:id});
    let Userid;
    let Username;
    if (!roleName) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    if (roleName.rolename === "admin") {
      // Admins have no User/Hostel profile; their token id is the AuthUser id.
      Userid = authUser._id;
      Username = "Admin";
    } else if(roleName.rolename === "hostelOwner"){
      const hostel = await Hostel.findOne({authUser:authUser._id});
      Userid = hostel._id;
      Username = hostel.owner_name;
    }else{
      const user = await User.findOne({authUser:authUser._id});
      Userid = user._id;
      Username = user.name;
    }

    // Validate the password (e.g., using bcrypt)
    const isPasswordValid = await bcrypt.compare(password, authUser.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Password Not Matched" });
    }

    // Generate and sign a JWT token
    const token = signToken({ id: Userid, userName: Username, userType: roleName.rolename });

    res.status(200).json({ token , roleName });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const updateUserById = async (req, res) => {
  try {
    const id = req.params.id;
    const {
      name,
      user_id,
      gender,
      phone_number,
      email_address,
      user_hostel_id,
    } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, user_id, gender, phone_number, email_address, user_hostel_id },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not Found" });
    }

    res
      .status(200)
      .json({ message: "User Updated Successfully", updatedData: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Something is Wrong" });
  }
};

const deleteUserById = async (req, res) => {
  try {
    const _id = req.params._id;

    const deletedUser = await User.findByIdAndDelete(_id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not Found" });
    }
    await AuthUser.findByIdAndDelete(deletedUser.authUser);
    res
      .status(200)
      .json({ message: "User Deleted Successfully", data: deletedUser });
  } catch (error) {
    res.status(500).json({ message: "Something Went Wrong" });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  getUserByAuthUserId,
  createUser,
  login,
  updateUserById,
  deleteUserById,
};

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const UserSchema = require("../models/userModel");
const User = UserSchema.User;
const AuthUserSchema = require("../models/authuserModel");
const AuthUser = AuthUserSchema.AuthUser;
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

    if (!data) {
      return res.status(500).json({ message: "User Not Found" });
    }

    res.status(201).json({ message: "Users fetched Successfully", data: data });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const createUser = async (req, res) => {
  try {
    const { username, password, name, gender, phone_number, email_address } =
      req.body;

    // Check if the username already exists in the AuthUser collection
    const existingAuthUser = await AuthUser.findOne({ username });
    if (existingAuthUser) {
      return res.status(409).json({ message: "Username already exists" });
    }

    // Create a new AuthUser document
    const newAuthUser = new AuthUser({
      username,
      password, // Hash the password before storing it (e.g., using bcrypt)
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

    const token = jwt.sign({ userId: newUser._id }, 'your-secret-key');  
    res.status(201).json({ message: "User Created Successfully" , token : token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" , error: error});
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log(username);

    // Find the AuthUser document based on the username
    const authUser = await AuthUser.findOne({ username });

    if (!authUser) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Validate the password (e.g., using bcrypt)
    const isPasswordValid = await bcrypt.compare(password, authUser.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Password Not Matched" });
    }

    // Generate and sign a JWT token
    const token = jwt.sign({ id: authUser._id }, "your-secret-key", {
      expiresIn: "1h",
    });

    res.status(200).json({ token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const authenticate = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, "your-secret-key");

    console.log(decoded);
    // Attach the user information to the request object
    req.user = { id: decoded.id };
    console.log(req.user);

    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
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
      { new: true, upsert: true }
    );

    if (!updatedUser) {
      return res.status(500).json({ message: "User not Found" });
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
    const _id = req.body._id;
    
    const deletedUser = await User.findByIdAndDelete(_id);
    const deleteAuthUser = await AuthUser.findByIdAndDelete(deletedUser.authUser)

    if (!deletedUser) {
      return res.status(500).json({ message: "User not Found" });
    }
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
  createUser,
  login,
  authenticate,
  updateUserById,
  deleteUserById,
};

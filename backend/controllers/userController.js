const UserSchema = require("../models/userModel");
const User = UserSchema.User;

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
    const { name, gender, phone_number, email_address, user_hostel_id } =
      req.body;

    if (
      !name ||
      !gender ||
      !phone_number ||
      !email_address ||
      !user_hostel_id
    ) {
      return res.status(500).json({ message: "Data is incomplete" });
    }

    const user = await User.findOne({
      $and: [
        { name: name },
        { gender: gender },
        { phone_number: phone_number },
        { email_address: email_address },
        { user_hostel_id: user_hostel_id },
      ],
    });
    if (user) {
      return res.status(500).json({ message: "User already exist" });
    }

    let generate_id = await User.countDocuments();
    generate_id += 1;
    let user_id = generate_id.toString();

    const newUser = new User({
      user_id,
      name,
      gender,
      phone_number,
      email_address,
      user_hostel_id,
    });

    await newUser.save();

    res.status(200).json({ message: "User Added Successfully", data: newUser });
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
    const id = req.params.id;

    const deletedUser = await User.findByIdAndDelete(id);

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
  updateUserById,
  deleteUserById,
};

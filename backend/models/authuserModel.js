const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const authUserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

// Hash the user's password before saving it to the database
authUserSchema.pre('save', async function (next) {
  try {
    const authuser = this;
    if (!authuser.isModified('password')) return next();

    // Generate a salt and hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(authuser.password, salt);

    // Replace the plain text password with the hashed password
    authuser.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

// Compare the provided password with the stored hashed password
authUserSchema.methods.comparePassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    throw new Error(error);
  }
};


exports.AuthUser = mongoose.model("AuthUser", authUserSchema);



const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
  rolename: {
    type: String,
    enum:["hostelOwner" , "hostelUser", "admin"],
    required: true,
  },
});

exports.Role = mongoose.model("Role", roleSchema);

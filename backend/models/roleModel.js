const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
  rolename: {
    type: String,
    enum:["hostelOwner" , "hostelUser"],
    required: true,
  },
});

exports.Role = mongoose.model("Role", roleSchema);

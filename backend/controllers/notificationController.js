const {Notification} = require('../models/notificationModel');
const {AuthUser} = require('../models/authuserModel');
const { Hostel } = require('../models/hostelModel');
const { User } = require('../models/userModel');

const getAllNotification = async (req , res) => {
    let authUserId = "";
    const {id , userType} = req.query;
    if(userType === "hostelOwner"){
        const data = await Hostel.findById(id);
        authUserId = data.authUser;
    }else if(userType === "hostelUser"){
        const data = await User.findById(id);
        authUserId = data.authUser;
    }

    try{
        const allNotification = await Notification.find({receiver : authUserId});
        res
        .status(201)
        .json({ message: "All Notification fetched Successfully", data: allNotification });
    }
    catch(err){
        res.status(500).json({ message: "Something went wrong" , error: err});
    }
}
const updateMarkReadField = async (req, res) => {
    const id = req.params.id;
    console.log(id);
    try {
      const allNotification = await Notification.updateMany(
        { receiver: id },
        { $set: { markRead: "yes" } }
      );
      res.status(201).json({
        message: "All Notifications are updated",
        data: allNotification,
      });
    } catch (err) {
      res.status(500).json({ message: "Something went wrong", error: err });
    }
  };
  

module.exports = {
    getAllNotification,
    updateMarkReadField,
};

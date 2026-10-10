const {Notification} = require('../models/notificationModel');
const { Hostel } = require('../models/hostelModel');
const { User } = require('../models/userModel');

// Notifications are addressed to AuthUser ids; tokens carry the Hostel/User id,
// so resolve the caller's AuthUser from the verified token rather than the query string.
const resolveAuthUserId = async ({ id, userType }) => {
    if (userType === "admin") return id;
    let data = null;
    if(userType === "hostelOwner"){
        data = await Hostel.findById(id);
    }else if(userType === "hostelUser"){
        data = await User.findById(id);
    }
    return data ? data.authUser : null;
};

const getAllNotification = async (req , res) => {
    try{
        const authUserId = await resolveAuthUserId(req.user);
        if (!authUserId) {
            return res.status(404).json({ message: "Account not found" });
        }
        const allNotification = await Notification.find({receiver : authUserId});
        res
        .status(200)
        .json({ message: "All Notification fetched Successfully", data: allNotification });
    }
    catch(err){
        console.log(err);
        res.status(500).json({ message: "Something went wrong" });
    }
}
const updateMarkReadField = async (req, res) => {
    try {
      const authUserId = await resolveAuthUserId(req.user);
      if (!authUserId || String(authUserId) !== String(req.params.id)) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const allNotification = await Notification.updateMany(
        { receiver: authUserId },
        { $set: { markRead: "yes" } }
      );
      res.status(200).json({
        message: "All Notifications are updated",
        data: allNotification,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Something went wrong" });
    }
  };


module.exports = {
    getAllNotification,
    updateMarkReadField,
};

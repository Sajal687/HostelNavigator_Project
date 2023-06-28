const nodemailer = require("nodemailer");

const {Booking} = require("../models/bookingModel");
const {User} = require("../models/userModel");
const {Hostel} = require("../models/hostelModel");
const {Notification} = require("../models/notificationModel");


const transporter = nodemailer.createTransport(
  {
    service: "gmail",
    auth: {
      user: "hostelbuddyservices@gmail.com",
      pass: "xwxllqqxnwyvfvuy",
    },
  }
);
const sendEmailNotification = (email, message) => {
  const mailOptions = {
    from: "hostelbuddyservices@gmail.com",
    to: "nemasajal781@gmail.com",
    subject: "New Booking Request",
    text: message,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
};


const getBookingByHostelId = async (req , res) => {
  try {
    const id = req.params.id;
    const data = await Booking.find({hostel:id});
    if (!data) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.status(200).json({ message: "Data find Successfully", data: data });
  } catch {
    console.log("Something Went Wrong");
    res.status(500).json({ message: "Something Went Wrong" });
  }
}

const createBooking = async (req, res) => {
  try {
    const {
      hostel_id,
      user_id,
      hostel_name,
      user_name,
      user_email,
      user_phone,
      checkin_date,
      user_gender,
      desired_roomtype,
    } = req.body;

    const hostel = await Hostel.findOne({ hostel_id });
    console.log(hostel.authUser)
    
    const existingbooking = await Booking.findOne({$and : [{ user: user_id } , {hostel:hostel._id} ]});
    if (existingbooking) {
      return res
      .status(409)
      .json({ message: "Booking Already Exist ! Wait for Owner Reaction" });
      return;
    }
    
    const booking = new Booking({
      hostel: hostel._id,
      user:user_id,
      hostel_name,
      user_name,
      user_email,
      user_phone,
      checkin_date,
      user_gender,
      desired_roomtype,
    });
    await booking.save();
        
    // Send notification email to the hostel owner
    const message = `Hurray!!,A new booking request by ${user_name}.`
    sendEmailNotification(hostel.owner_email , message);
    

    const receiver = hostel.authUser;
    console.log(receiver);
    const user = await User.findById(user_id);
    const sender = user.authUser;
    const readStatus = "no";
    
    const notification = new Notification({
      sender,
      receiver,
      message,
      markRead: readStatus,
    })
    await notification.save();

    res.status(200).json({ booking });
  } catch (error) {
    console.log("Error creating booking:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Update booking status
const updateBookingStatus = async (req, res) => {
  const { bookingId, status } = req.body;
  console.log(bookingId)
  try {
    // Update the booking status
    const booking = await Booking.findByIdAndUpdate(
       bookingId,
      { status },
      { new: true }
    );

    console.log(booking)

    // Get the user's email
    const user = await User.findById(booking.user);
    const receiver = user.authUser;
    const hostel = await Hostel.findById(booking.hostel);
    const sender = hostel.authUser;

    let message = "";
    if(status === "accept"){
      message = `Your booking request for ${booking.hostel_name} has been accepted.`;
      sendEmailNotification(user.email_address, message);
    }else{
      message = `Your booking request for ${booking.hostel_name} has been rejected.`;
      sendEmailNotification(user.email_address, message);
    }

    const notification = new Notification({
      sender,
      receiver,
      message : message,
      markRead: "no",
    })
    await notification.save();

    // Return the updated booking
    res.status(200).json({ booking });
  } catch (error) {
    console.log("Error updating booking status:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = {
  getBookingByHostelId,
  createBooking,
  updateBookingStatus,
};

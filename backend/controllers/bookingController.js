const {Booking} = require("../models/bookingModel");
const {User} = require("../models/userModel");
const {Hostel} = require("../models/hostelModel");
const {Notification} = require("../models/notificationModel");
const { sendEmailNotification, siteUrl } = require("../services/email");


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
    // The booking is always made on behalf of the logged-in user, never a user_id from the body.
    const user_id = req.user.id;
    const {
      hostel_id,
      hostel_name,
      user_name,
      user_email,
      user_phone,
      checkin_date,
      user_gender,
      desired_roomtype,
    } = req.body;

    const hostel = await Hostel.findOne({ hostel_id: String(hostel_id) });
    if (!hostel) {
      return res.status(404).json({ message: "Hostel not found" });
    }

    const existingbooking = await Booking.findOne({$and : [{ user: user_id } , {hostel:hostel._id} ]});
    if (existingbooking) {
      return res
      .status(409)
      .json({ message: "Booking Already Exist ! Wait for Owner Reaction" });
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
        
    // In-app notification text (short) and a fuller email for the owner.
    const message = `Hurray!!,A new booking request by ${user_name}.`
    sendEmailNotification(
      hostel.owner_email,
      [
        `Hi ${hostel.owner_name},`,
        ``,
        `${user_name} has requested to book ${hostel.hostel_name}.`,
        ``,
        `Check-in date: ${checkin_date}`,
        `Room type:     ${desired_roomtype}`,
        `Email:         ${user_email}`,
        `Phone:         ${user_phone}`,
        ``,
        `Accept or reject the request in your dashboard: ${siteUrl("/ownerdashboard")}`,
        `You can reply to this email to contact the student directly.`,
        ``,
        `- HostelNavigator`,
      ].join("\n"),
      `New booking request for ${hostel.hostel_name}`,
      { replyTo: user_email }
    );


    const receiver = hostel.authUser;
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
  const { bookingId } = req.params;
  const { status } = req.body;
  if (status !== "accept" && status !== "reject") {
    return res.status(400).json({ message: "Status must be 'accept' or 'reject'" });
  }
  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    // Owner tokens carry their hostel's id, so owners can only act on their own bookings.
    if (String(booking.hostel) !== String(req.user.id)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    booking.status = status === "accept" ? "accepted" : "rejected";
    await booking.save();

    // Get the user's email
    const user = await User.findById(booking.user);
    const receiver = user.authUser;
    const hostel = await Hostel.findById(booking.hostel);
    const sender = hostel.authUser;

    let message = "";
    if(status === "accept"){
      message = `Your booking request for ${booking.hostel_name} has been accepted.`;
    }else{
      message = `Your booking request for ${booking.hostel_name} has been rejected.`;
    }
    const accepted = status === "accept";
    sendEmailNotification(
      user.email_address,
      [
        `Hi ${user.name},`,
        ``,
        message,
        ``,
        accepted
          ? `Next steps: contact the owner to confirm your move-in, deposit and agreement.\nOwner: ${hostel.owner_name} - ${hostel.owner_phone_number} - ${hostel.owner_email}`
          : `You can browse other hostels here: ${siteUrl("/hostellist")}`,
        ``,
        `- HostelNavigator`,
      ].join("\n"),
      `Booking ${accepted ? "accepted" : "update"}: ${booking.hostel_name}`,
      { replyTo: accepted ? hostel.owner_email : undefined }
    );

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

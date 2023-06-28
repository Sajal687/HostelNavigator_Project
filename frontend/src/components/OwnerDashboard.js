/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
} from "@mui/material";
// import { Edit } from "@mui/icons-material";
import Carousel from "react-material-ui-carousel";
import {BASE_URL} from '../services/helper';


const OwnerDashboard = () => {
  const [hostelDetails, setHostelDetails] = useState({});
  const [bookingRequests, setBookingRequests] = useState([]);
  const [changeStatus, setChangeStatus] = useState(false);
  const [allPendingStatus, setAllPendingStatus] = useState(true);

  useEffect(() => {
    const fetchHostelById = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log(token);
        const encodePayload = token.split(".")[1];
        const decodedPayload = JSON.parse(window.atob(encodePayload));
        const id = decodedPayload.id;
        console.log(id);

        if (token) {
          const response = await axios.get(
            `${BASE_URL}/hostels/${id}`,
            {
              headers: {
                authorization: token,
              },
            }
          );
          const { data } = response.data;
          convertBufferToBase64(data);

          const res = await axios.get(`${BASE_URL}/bookings/${id}`, {
            headers: {
              authorization: token,
            },
          });
          console.log(res.data.data);
          setBookingRequests(res.data.data);

          const nothingPending = res.data.data.map((request) => {
            if(request.status === "pending"){
                return "pending"
            }else{
              return "nope"
            }
          });
          setAllPendingStatus(nothingPending.includes("pending"));
        }
      } catch (error) {
        console.log("Error fetching hostel details:", error);
      }
    };
    fetchHostelById();
  }, [changeStatus]);


  const convertBufferToBase64 = (data) => {
    const updatedData = () => {
      const base64Image = data.hostel_img.map((img) => {
        return arrayBufferToBase64(img.data.data);
      });
      return {
        ...data,
        hostel_img: base64Image,
      };
    }
    setHostelDetails(updatedData);
  };

  const arrayBufferToBase64 = (arrayBuffer) => {
    let binary = "";
    const bytes = new Uint8Array(arrayBuffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };


  // const handleEditField = (field) => {
  //   // Handle edit functionality for the field
  //   console.log(`Edit ${field}`);
  // };

  const handleAcceptRequest = async (bookingId) => {
    console.log(`Accept request with ID: ${bookingId}`);
    try {
      const response = await axios({
        method: "put",
        url: `${BASE_URL}/bookings/${bookingId}`,
        data: {
          bookingId: bookingId,
          status: "accept",
        },
      });
      console.log(response.data.booking.status);
      setChangeStatus(!changeStatus);
    } catch (err) {
      console.log(err);
    }
  };

  const handleRejectRequest = async (bookingId) => {
    console.log(`Reject request with ID: ${bookingId}`);
    try {
      const response = await axios({
        method: "put",
        url: `${BASE_URL}/bookings/${bookingId}`,
        data: {
          bookingId: bookingId,
          status: "reject",
        },
      });
      console.log(response.data.booking.status);
      setChangeStatus(!changeStatus);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Box maxWidth={600} mx="auto">
      {Object.keys(hostelDetails).length > 0 ? (
        
        <Card>
          <CardContent>
            <Typography variant="h4" gutterBottom>
              {hostelDetails.hostel_name}
            </Typography>

            <Grid container spacing={2} >
            <Grid item xs={12}>
            <Carousel animation="slide">
             {hostelDetails.hostel_img.map((image, index) => (
                <img
                  key={index}
                  src={`data:image/jpeg;base64,${image}`}
                  alt={`${index + 1}`}
                 style={{height: "300px",objectFit: "cover", width:"100%"}}
               />
               ))}
            </Carousel>
           </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{fontWeight: 600}}>
                  Hostel Details
                  {/* <IconButton
                    aria-label="edit"
                    size="small"
                    onClick={() => handleEditField("hostel_details")}
                  >
                    <Edit />
                  </IconButton> */}
                </Typography>
                <Typography>
                  Address:{" "}
                  {`${hostelDetails.hostel_address.street}, ${hostelDetails.hostel_address.city}, ${hostelDetails.hostel_address.state}, ${hostelDetails.hostel_address.postal_code}`}
                </Typography>
                <Typography>Owner Name: {hostelDetails.owner_name}</Typography>
                <Typography>
                  Owner Email: {hostelDetails.owner_email}
                </Typography>
                <Typography>
                  Owner Phone: {hostelDetails.owner_phone_number}
                </Typography>
                {/* Add other hostel details here */}
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{fontWeight: 600}}>
                  Hostel Rooms
                </Typography>
                <Typography>
                  Room Number: {hostelDetails.hostel_rooms.room_number}
                  <br />
                  Room Capacity:{" "}
                  {hostelDetails.hostel_rooms.room_capacity.join(", ")}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{fontWeight: 600}}>
                  Hostel Facilities
                </Typography>
                {hostelDetails.hostel_facilities.map((facility) => (
                  <Typography key={facility}>{facility}</Typography>
                ))}
              </Grid>
            </Grid>

            <Typography variant="h6" mt={4} sx={{fontWeight: 600}}>
              Booking Requests
            </Typography>

            {bookingRequests.map((request) =>
              request.status === "pending" ? (
                <Card key={request._id} variant="outlined" sx={{ mt: 2 }}>
                  <CardContent>
                    <Typography>User: {request.user_name}</Typography>
                    <Typography>
                      User Email Address: {request.user_email}
                    </Typography>
                    <Typography>
                      Check-in Date: {request.checkin_date}
                    </Typography>
                    <Typography>
                      Room Type: {request.desired_roomtype}
                    </Typography>
                    <Typography>Status: {request.status}</Typography>
                  </CardContent>
                  <Box display="flex" justifyContent="flex-end" p={2}>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => handleAcceptRequest(request._id)}
                      sx={{ mr: 2 }}
                    >
                      Accept
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleRejectRequest(request._id)}
                    >
                      Reject
                    </Button>
                  </Box>
                </Card>
              ) : (
                " "
              )
            )}
            {bookingRequests.length === 0 || !allPendingStatus ? (
              <Typography>No Pending Request is Present</Typography>
            ) : (
              " "
            )}
          </CardContent>
        </Card>
      ) : (
        <Typography variant="h5" align="center">
          Loading hostel details...
        </Typography>
      )}
    </Box>
  );
};

export default OwnerDashboard;

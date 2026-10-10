/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Alert,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Tab,
  Tabs,
} from "@mui/material";
// import { Edit } from "@mui/icons-material";
import Carousel from "react-material-ui-carousel";
import {BASE_URL} from '../services/helper';
import { getErrorMessage } from "../services/apiClient";
import ListingDetailsEditor from "./owner/ListingDetailsEditor";
import ListingSettings from "./owner/ListingSettings";
import OwnerInquiries from "./owner/OwnerInquiries";
import OwnerReviews from "./owner/OwnerReviews";

const OwnerDashboard = () => {
  const [hostelDetails, setHostelDetails] = useState({});
  const [bookingRequests, setBookingRequests] = useState([]);
  const [changeStatus, setChangeStatus] = useState(false);
  const [allPendingStatus, setAllPendingStatus] = useState(true);
  const [tab, setTab] = useState("overview");
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const fetchHostelById = async () => {
      setLoadError("");
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoadError("Please log in as a hostel owner to see your dashboard.");
          return;
        }
        // console.log(token);
        const encodePayload = token.split(".")[1];
        const decodedPayload = JSON.parse(window.atob(encodePayload));
        const id = decodedPayload.id;
        // console.log(id);

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
          // console.log(res.data.data);
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
        setLoadError(getErrorMessage(error, "We couldn't load your dashboard. Please log in again."));
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
    // console.log(`Accept request with ID: ${bookingId}`);
    try {
      await axios({
        method: "put",
        url: `${BASE_URL}/bookings/${bookingId}`,
        data: {
          bookingId: bookingId,
          status: "accept",
        },
      });
      setChangeStatus(!changeStatus);
    } catch (err) {
      // console.log(err);
    }
  };

  const handleRejectRequest = async (bookingId) => {
    // console.log(`Reject request with ID: ${bookingId}`);
    try {
      await axios({
        method: "put",
        url: `${BASE_URL}/bookings/${bookingId}`,
        data: {
          bookingId: bookingId,
          status: "reject",
        },
      });
      setChangeStatus(!changeStatus);
    } catch (err) {
      // console.log(err);
    }
  };

  const pendingCount = bookingRequests.filter((request) => request.status === "pending").length;

  return (
    <Box maxWidth={900} mx="auto" px={{ xs: 1, sm: 2 }} py={2}>
      {loadError ? (
        <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => setChangeStatus(!changeStatus)}>Retry</Button>}>
          {loadError}
        </Alert>
      ) : Object.keys(hostelDetails).length > 0 ? (

        <Card>
          <CardContent>
            <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: "1.6rem", md: "2.1rem" } }}>
              {hostelDetails.hostel_name}
            </Typography>

            <Tabs value={tab} onChange={(_, value) => setTab(value)} variant="scrollable" allowScrollButtonsMobile sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}>
              <Tab label="Overview" value="overview" />
              <Tab label={pendingCount ? `Bookings (${pendingCount})` : "Bookings"} value="bookings" />
              <Tab label="Inquiries" value="inquiries" />
              <Tab label="Reviews" value="reviews" />
            </Tabs>

            {tab === "inquiries" && <OwnerInquiries />}
            {tab === "reviews" && <OwnerReviews />}

            {tab === "overview" && (
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
              <Grid item xs={12}>
                <ListingSettings key={hostelDetails._id} hostel={hostelDetails} />
              </Grid>
              <Grid item xs={12}>
                <ListingDetailsEditor
                  key={hostelDetails._id}
                  hostelId={hostelDetails._id}
                  description={hostelDetails.description}
                  houseRules={hostelDetails.house_rules}
                />
              </Grid>
            </Grid>
            )}

            {tab === "bookings" && (
            <>
            <Typography variant="h6" sx={{fontWeight: 600}}>
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
                  <Box display="flex" justifyContent="flex-end" gap={2} p={2} flexWrap="wrap">
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => handleAcceptRequest(request._id)}
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
            </>
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

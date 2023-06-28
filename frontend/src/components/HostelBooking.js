/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast"
import axios from "axios";
import { useForm } from "react-hook-form";
import {BASE_URL} from '../services/helper';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  FormControlLabel,
  Checkbox,
  CardContent,
  CardMedia,
  InputLabel,
} from "@mui/material";

const HostelBooking = () => {
  const [userDetails, setUserDetails] = useState({
    userId: "",
    name: "",
    email: "",
    phone: "",
    gender: "",
  });

  const navigate = useNavigate();
  const location = useLocation();
  const hostelDetails = location.state;

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const userData = async () => {
      try{
      const token = localStorage.getItem("token");
  
      const encodedPayload = token.split(".")[1];
      const decodedPayload = JSON.parse(window.atob(encodedPayload));
      const userId = decodedPayload.id;

      if(!token){
        navigate('/login');
      }
      
      if (token) {
          const response = await axios.get(`${BASE_URL}/users/${userId}`, {
          headers: {
            authorization: token,
          },
         })
        const { data } = response; 
        setUserDetails({
            name: data.data.name,
            email: data.data.email_address,
            phone: data.data.phone_number,
            gender: data.data.gender,
            userId: data.data._id,
            });
          }
        }
       catch(error){
          console.log("Error fetching user details:", error);
        };
      };
      userData();
  },[]);

  const handleBookingSubmission = handleSubmit(async (data) => {
    const formData = new FormData();

    formData.append("user_id", userDetails.userId);
    formData.append("hostel_id", hostelDetails.hostel_id);
    formData.append("hostel_name", hostelDetails.name);
    formData.append("user_name", userDetails.name);
    formData.append("user_email", userDetails.email);
    formData.append("user_phone", userDetails.phone);
    formData.append("checkin_date", data.checkInDate);
    formData.append("user_gender", userDetails.gender);
    formData.append("desired_roomtype", data.roomType);

    // for (const value of formData.values()) {
    //   console.log(value);
    // }
    const token = localStorage.getItem("token");

      try {
        const response = await axios.post(
          `${BASE_URL}/bookings`,
          formData,
          {
            headers: {
              "Content-Type": "application/json",
              "authorization": token,
            },
          }
        );
  
        if (response.status === 200) {
          toast(`Congratulations! Your request for the ${hostelDetails.name} has been sent successfully.We'll notify you once it's confirmed!`)
          navigate('/hostellist');
        } else {
          toast.error("Some error occurred")
        }
      } 
     catch (err){
      toast(err.response.status === 409 ? `Booking Already Exist for ${hostelDetails.name}` : "");
      navigate('/hostellist');
      console.log(err);
    }
  });

  return (
    <Box maxWidth={400} mx="auto">
      <Card>
        <CardMedia
          height={200}
          component="img"
          src={`data:image/jpeg;base64,${hostelDetails.image[1]}`}
          alt={hostelDetails.name}
        />
        <CardContent>
          <Typography
            variant="h4"
            gutterBottom
            sx={{ fontWeight: 600, textAlign: "center" }}
          >
            {hostelDetails.name}
          </Typography>

          <form onSubmit={handleSubmit(handleBookingSubmission)}>
            <Grid container>
              <InputLabel
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: "20px",
                  fontWeight: 700,
                }}
              >
                Your Name
              </InputLabel>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  fullWidth
                  value={userDetails.name}
                  disabled
                />
              </Grid>

              <InputLabel
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: "20px",
                  fontWeight: 700,
                }}
              >
                Email
              </InputLabel>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  fullWidth
                  value={userDetails.email}
                  disabled
                />
              </Grid>

              <InputLabel
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: "20px",
                  fontWeight: 700,
                }}
              >
                Phone Number
              </InputLabel>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  fullWidth
                  value={userDetails.phone}
                  disabled
                />
              </Grid>

              <InputLabel
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: "20px",
                  fontWeight: 700,
                }}
              >
                Expected Joining Date
              </InputLabel>
              <Grid item xs={12}>
                <TextField
                  {...register("checkInDate", { required: true })}
                  variant="outlined"
                  required="true"
                  fullWidth
                  type="date"
                  error={!!errors.checkInDate}
                  helperText={errors.checkInDate && "Check-in date is required"}
                />
              </Grid>

              <InputLabel
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: "20px",
                  fontWeight: 700,
                }}
              >
                Desire Room Type
              </InputLabel>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      {...register("roomType")}
                      value="single"
                      color="primary"
                    />
                  }
                  label="Single"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      {...register("roomType")}
                      value="double"
                      color="primary"
                    />
                  }
                  label="Double"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      {...register("roomType")}
                      value="triple"
                      color="primary"
                    />
                  }
                  label="Triple"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      {...register("roomType")}
                      value="multi-sharing"
                      color="primary"
                    />
                  }
                  label="Multi-Sharing"
                />
                {errors.roomType && (
                  <Typography variant="body2" color="error">
                    Room type is required
                  </Typography>
                )}
              </Grid>
            </Grid>
            <Box mt={2}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                type="submit"
              >
                Submit Booking
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default HostelBooking;

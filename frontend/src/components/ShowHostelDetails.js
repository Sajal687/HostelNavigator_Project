import React from "react";
import Carousel from "react-material-ui-carousel";
import { Typography, Grid, Chip } from "@mui/material";
import { useLocation } from "react-router-dom";

import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from '@mui/icons-material/Email';
import AccessibilityIcon from "@mui/icons-material/Accessibility";
import StarIcon from "@mui/icons-material/Star";
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';

const ShowHostelDetails = () => {
  const location = useLocation();
  const hostelDetails = location.state;
  const carouselImages = hostelDetails.image;

  return (
    <Grid container spacing={2} sx={{ border: "2px solid black", p: 2 }}>
      <Grid item xs={12}>
        <Carousel animation="slide">
          {carouselImages.map((image, index) => (
            <img
              key={index}
              src={`data:image/jpeg;base64,${image}`}
              alt={`Hostel Image ${index + 1}`}
              style={{height: "300px",objectFit: "cover", width:"100%"}}
            />
          ))}
        </Carousel>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h2" align="center">
          {hostelDetails.name}
        </Typography>
      </Grid>
      <Grid item xs={6} md={6}>
        <Typography variant="subtitle1">
          <strong>Rent:</strong> {<CurrencyRupeeIcon sx={{ ml: 1, color: "gray" , fontSize:"large" }}/>}{hostelDetails.rent}
        </Typography>
      </Grid>
      <Grid item xs={6} md={6}>
        <Typography variant="subtitle1" align="right">
          <strong>Rating:</strong> {hostelDetails.rating}
          <StarIcon sx={{ ml: 1, color: "orange" }} />
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="subtitle1">
          <LocationOnIcon sx={{ mr: 1 }} />
          <strong>Address:</strong> {`${hostelDetails.address.street}, ${hostelDetails.address.city}`}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="subtitle1">
          <PersonIcon sx={{ mr: 1 }} />
          <strong>Owner Name:</strong> {hostelDetails.ownerName}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="subtitle1">
          <PhoneIcon sx={{ mr: 1 }} />
          <strong>Contact Phone:</strong> {hostelDetails.contactPhn}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="subtitle1">
          <EmailIcon sx={{ mr: 1 }} />
          <strong>Email:</strong> {hostelDetails.email}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="subtitle1">
          <AccessibilityIcon sx={{ mr: 1 }} />
          <strong>Allow Gender:</strong> {hostelDetails.allowGender}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="subtitle1">
          <strong>Facilities:</strong>
        </Typography>
        <Grid container spacing={1}>
          {hostelDetails.facilities.map((facility, index) => (
            <Grid item key={index}>
              <Chip label={facility} variant="outlined" sx={{background:"#abd1ca"}}/>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default ShowHostelDetails;

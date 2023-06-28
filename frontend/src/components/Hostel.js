/* eslint-disable-next-line react-hooks/exhaustive-deps */
import React, { useState , useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Typography,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import PhoneIcon from "@mui/icons-material/Phone";
import RoomIcon from "@mui/icons-material/Room";
import StarIcon from "@mui/icons-material/Star";

const Hostel = ({
  hostel_id,
  name,
  address,
  rent,
  rating,
  image,
  ownerName,
  contactPhn,
  email,
  allowGender,
  facilities,
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [userDetails, setUserDetails] = useState({});
  const navigate = useNavigate();
  
  useEffect(()=>{
    const token = localStorage.getItem("token");
    if(token){
    const encodedPayload = token.split(".")[1];
    const decodedPayload = JSON.parse(window.atob(encodedPayload));

    const TokenExpiry = decodedPayload.exp;
    const currentTime = new Date().getTime() / 1000;
    if(TokenExpiry < currentTime){    //if Token expires then send back to login Page
      navigate("/login", { state: [hostelDetails , {userType:"hostelUser"}]  });
    }
    setUserDetails(decodedPayload);
  }
  },[]);

 
  const handleToggleFavorite = () => {
    setIsFavorite((prevIsFavorite) => !prevIsFavorite);
  };


  const hostelDetails = {
    hostel_id,
    name,
    address,
    rent,
    rating,
    image,
    ownerName,
    contactPhn,
    email,
    allowGender,
    facilities,
  };

  const handleMoreDetails = () => {
    navigate("/hosteldetails", { state: hostelDetails });
  };

  const handleBooking = () => {
    // console.log(userDetails , Object.keys(userDetails).length === 0 );
    if(Object.keys(userDetails).length === 0){      //If no user is loggedin
      navigate("/login",{state:[hostelDetails,{userType:"hostelUser"}]});  
    }
    if (userDetails.userType === "hostelUser") {    //If hostelUser is already loggedin
      navigate("/bookinghostel", { state: hostelDetails });
    }
  };


  return (
    <Box maxWidth={300}>
      <Card>
        <CardMedia
          height={200}
          component="img"
          src={`data:image/jpeg;base64,${image[1]}`}
          alt={name}
        />
        <CardContent>
          <Grid sx={{ display: "flex" }}>
            <Typography
              variant="h5"
              gutterBottom
              sx={{ display: "inline-block" }}
            >
              {name}
            </Typography>
            <Box marginLeft="auto" component="span">
              <FavoriteIcon
                sx={{
                  color: isFavorite ? "blue" : "inherit",
                  "&:hover": {
                    color: "lightblue",
                    cursor: "pointer",
                  },
                }}
                onClick={handleToggleFavorite}
              />
            </Box>
          </Grid>

          <Box display="flex" alignItems="center" marginBottom={1}>
            <StarIcon sx={{ color: "orange", marginRight: 1 }} />
            <Typography variant="subtitle1">{rating}</Typography>
          </Box>
          <Box display="flex" alignItems="center" marginBottom={1}>
            <PhoneIcon sx={{ marginRight: 1 }} />
            <Typography variant="subtitle2">{contactPhn}</Typography>
          </Box>
          <Box display="flex" alignItems="center">
            <RoomIcon sx={{ marginRight: 1 }} />
            <Typography variant="subtitle2">
              {address.street},{address.city}
            </Typography>
          </Box>
        </CardContent>
        <CardActions>
          <Button size="small" variant="contained" onClick={handleMoreDetails}>
            More Details
          </Button>
          {userDetails.userType !== "hostelOwner" && 
            <Button size="small" variant="contained" onClick={handleBooking}>
              Book Hostel
            </Button>
          }
        </CardActions>
      </Card>
    </Box>
  );
};

export default Hostel;

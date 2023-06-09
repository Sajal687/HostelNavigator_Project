import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';

import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Typography
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import PhoneIcon from "@mui/icons-material/Phone";
import RoomIcon from "@mui/icons-material/Room";
import StarIcon from "@mui/icons-material/Star";


const Hostel = ({
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
  const navigate = useNavigate()

  const handleToggleFavorite = () => {
    setIsFavorite((prevIsFavorite) => !prevIsFavorite);
  };

  const handleMoreDetails = () => {
    const hostelDetails = {
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

    navigate("/hosteldetails", {state : hostelDetails} )
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
          <Grid sx={{display : "flex"}}>
          <Typography variant="h5" gutterBottom sx={{display:"inline-block"}}>
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
            <Typography variant="subtitle2">{address.street},{address.city}</Typography>
          </Box>
        </CardContent>
        <CardActions>
        <Button size="small" variant="contained" onClick={handleMoreDetails}>
            More Details
          </Button>
        <Button size="small" variant="contained" onClick={handleMoreDetails}>
            Book Hostel
        </Button>
        </CardActions>
      </Card>
    </Box>
  );
};

export default Hostel;

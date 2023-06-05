import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Typography,
  Chip,
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
  contactPhn,
  allowGender,
  facilities,
}) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const handleToggleFavorite = () => {
    setIsFavorite((prevIsFavorite) => !prevIsFavorite);
  };

  return (
    <Box maxWidth={300}>
      <Card>
        <CardMedia
          height={200}
          component="img"
          src={`data:image/jpeg;base64,${image}`}
          alt={name}
        />
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {name}
          </Typography>
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
            <Typography variant="subtitle2">{address.city}</Typography>
          </Box>
        </CardContent>
        <CardActions>
          <Button size="small" variant="contained">
            More Details
          </Button>
          <Box marginLeft="auto">
            <Chip
              icon={
                <FavoriteIcon
                  sx={{
                    color: isFavorite ? "red" : "inherit",
                    "&:hover": {
                      color: "red",
                      cursor: "pointer",
                    },
                  }}
                  onClick={handleToggleFavorite}
                />
              }
              label={isFavorite ? "Added to Favorites" : "Add to Favorites"}
              color={isFavorite ? "primary" : "default"}
              variant="outlined"
              clickable
              onClick={handleToggleFavorite}
            />
          </Box>
        </CardActions>
      </Card>
    </Box>
  );
};

export default Hostel;

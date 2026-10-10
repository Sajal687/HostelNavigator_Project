/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState , useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Button,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import VerifiedIcon from "@mui/icons-material/Verified";
import NearMeOutlinedIcon from "@mui/icons-material/NearMeOutlined";
import RestaurantOutlinedIcon from "@mui/icons-material/RestaurantOutlined";
import LocalLaundryServiceOutlinedIcon from "@mui/icons-material/LocalLaundryServiceOutlined";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import BathtubOutlinedIcon from "@mui/icons-material/BathtubOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import KitchenOutlinedIcon from "@mui/icons-material/KitchenOutlined";
import WaterDropOutlinedIcon from "@mui/icons-material/WaterDropOutlined";
import { imageSrc } from "../services/images";
import { tokens } from "../theme";

// Short, student-friendly labels for the most useful facilities, in display priority.
const AMENITY_BADGES = [
  { facility: "Dining Hall", label: "Mess", icon: <RestaurantOutlinedIcon /> },
  { facility: "24/7 Electricity", label: "Power backup", icon: <BoltOutlinedIcon /> },
  { facility: "Laundry", label: "Laundry", icon: <LocalLaundryServiceOutlinedIcon /> },
  { facility: "Separate Bathroom", label: "Attached bath", icon: <BathtubOutlinedIcon /> },
  { facility: "Library", label: "Library", icon: <MenuBookOutlinedIcon /> },
  { facility: "Kitchen", label: "Kitchen", icon: <KitchenOutlinedIcon /> },
  { facility: "Water Supply", label: "Water 24/7", icon: <WaterDropOutlinedIcon /> },
];
const MAX_BADGES = 3;

const genderLabel = (value) => (value === "Both" ? "Co-ed" : value);
const formatRent = (value) => Number(value).toLocaleString("en-IN");

const Hostel = ({
  id,
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
  isVerified,
  distanceKm,
  hasVacancy = true,
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
    id,
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
    // The id in the URL lets the details page reload itself after a refresh or shared link.
    navigate(`/hosteldetails?id=${id}`, { state: hostelDetails });
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

  const badges = AMENITY_BADGES.filter((badge) => (facilities || []).includes(badge.facility));
  const extraCount = Math.max(0, (facilities || []).length - Math.min(badges.length, MAX_BADGES));
  const canBook = userDetails.userType !== "hostelOwner" && userDetails.userType !== "admin";

  return (
    <Card
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        borderRadius: 4,
        transition: "transform 200ms ease, box-shadow 200ms ease",
        "&:hover": { transform: "translateY(-4px)", boxShadow: 6 },
        "&:hover .hostel-card-image": { transform: "scale(1.03)" },
      }}
    >
      <CardActionArea onClick={handleMoreDetails} sx={{ flexGrow: 1, display: "flex", flexDirection: "column", alignItems: "stretch" }}
        aria-label={`View details for ${name}`}>
        <Box sx={{ position: "relative", aspectRatio: "4 / 3", overflow: "hidden", backgroundColor: tokens.surfaceMuted }}>
          <Box
            component="img"
            className="hostel-card-image"
            src={imageSrc(image[1] || image[0])}
            alt={name}
            loading="lazy"
            sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 300ms ease" }}
          />
          <Stack direction="row" spacing={0.75} sx={{ position: "absolute", top: 12, left: 12 }}>
            {isVerified && (
              <Chip icon={<VerifiedIcon />} label="Verified" size="small" color="success"
                sx={{ backgroundColor: "rgba(255,255,255,0.95)", fontWeight: 600 }} />
            )}
            {!hasVacancy && <Chip label="Full" size="small" color="warning" sx={{ fontWeight: 600 }} />}
          </Stack>
        </Box>

        <CardContent sx={{ flexGrow: 1, pb: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
            <Typography variant="subtitle1" component="h3" fontWeight={700} color="text.primary" lineHeight={1.3}
              sx={{ overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
              {name}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={0.25} flexShrink={0}>
              <StarRoundedIcon sx={{ color: "#f59e0b", fontSize: 20 }} />
              <Typography variant="body2" fontWeight={600} color="text.primary">{rating ? rating : "New"}</Typography>
            </Stack>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={0.5} mt={0.5} color="text.secondary">
            <PlaceOutlinedIcon sx={{ fontSize: 16, color: tokens.caption }} />
            <Typography variant="body2" noWrap>
              {[address?.street, address?.city].filter(Boolean).join(", ")}
            </Typography>
          </Stack>

          <Stack direction="row" flexWrap="wrap" gap={0.75} mt={1.5}>
            {typeof distanceKm === "number" && (
              <Chip icon={<NearMeOutlinedIcon />} label={distanceKm < 1 ? "< 1 km" : `${distanceKm} km`} size="small" color="primary" variant="outlined" />
            )}
            {allowGender && <Chip label={genderLabel(allowGender)} size="small" variant="outlined" />}
            {badges.slice(0, MAX_BADGES).map((badge) => (
              <Chip key={badge.facility} icon={badge.icon} label={badge.label} size="small" variant="outlined"
                sx={{ "& .MuiChip-icon": { fontSize: 16, color: tokens.body } }} />
            ))}
            {extraCount > 0 && <Chip label={`+${extraCount}`} size="small" variant="outlined" />}
          </Stack>
        </CardContent>
      </CardActionArea>

      <Tooltip title={isFavorite ? "Remove from saved" : "Save"}>
        <IconButton
          onClick={handleToggleFavorite}
          aria-label={isFavorite ? "Remove from saved" : "Save hostel"}
          aria-pressed={isFavorite}
          size="small"
          sx={{
            position: "absolute",
            top: 10,
            right: 10,
            backgroundColor: "rgba(255,255,255,0.95)",
            boxShadow: 1,
            "&:hover": { backgroundColor: "#fff", transform: "scale(1.08)" },
          }}
        >
          {isFavorite ? <FavoriteIcon sx={{ color: "#ef4444" }} fontSize="small" /> : <FavoriteBorderIcon fontSize="small" sx={{ color: tokens.heading }} />}
        </IconButton>
      </Tooltip>

      <Stack direction="row" alignItems="center" justifyContent="space-between" px={2} py={1.5} borderTop={`1px solid ${tokens.border}`}>
        <Typography component="p" sx={{ fontWeight: 800, fontSize: "1.15rem", color: tokens.heading, letterSpacing: "-0.01em" }}>
          ₹{formatRent(rent)}
          <Typography component="span" variant="body2" sx={{ fontWeight: 500, ml: 0.25 }}>/mo</Typography>
        </Typography>
        {canBook && (
          <Button size="small" variant="contained" onClick={handleBooking} disabled={!hasVacancy}>
            {hasVacancy ? "Book" : "Full"}
          </Button>
        )}
      </Stack>
    </Card>
  );
};

export default Hostel;

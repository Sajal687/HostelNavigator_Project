import React, { useEffect, useState } from "react";
import Carousel from "react-material-ui-carousel";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import StarIcon from "@mui/icons-material/Star";
import VerifiedIcon from "@mui/icons-material/Verified";
import CheckIcon from "@mui/icons-material/Check";
import RemoveIcon from "@mui/icons-material/Remove";
import AiInsightsCard from "./ai/AiInsightsCard";
import InquiryDialog from "./hostel/InquiryDialog";
import ReviewsSection from "./hostel/ReviewsSection";
import { getPublicHostel } from "../services/hostelService";
import { getAiStatus } from "../services/aiService";
import { getErrorMessage } from "../services/apiClient";
import { getCurrentUser } from "../services/auth";
import { imageSrc, toBase64Images } from "../services/images";
import { ROOM_TYPES } from "../constants/listing";

// Same shape the hostel cards pass through router state (also used by HostelBooking).
const toHostelDetails = (hostel) => ({
  id: hostel._id,
  hostel_id: hostel.hostel_id,
  name: hostel.hostel_name,
  address: hostel.hostel_address,
  rent: hostel.hostel_rent,
  rating: hostel.hostel_rating,
  reviewCount: hostel.review_count || 0,
  image: toBase64Images(hostel.hostel_img),
  ownerName: hostel.owner_name,
  contactPhn: hostel.owner_phone_number,
  email: hostel.owner_email,
  allowGender: hostel.hostel_gender_type,
  facilities: hostel.hostel_facilities || [],
  roomTypes: hostel.hostel_rooms?.room_capacity || [],
  totalRooms: hostel.hostel_rooms?.room_number,
  hasVacancy: hostel.has_vacancy !== false,
  isVerified: Boolean(hostel.isVerified),
  description: hostel.description,
  houseRules: hostel.house_rules,
});

const genderLabel = (value) => (value === "Both" ? "Co-ed" : value);
const formatRent = (value) => Number(value).toLocaleString("en-IN");

const ShowHostelDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hostelId = location.state?.id || searchParams.get("id");
  // Card data (if any) renders instantly; the full public record replaces it once loaded.
  const [hostelDetails, setHostelDetails] = useState(location.state || null);
  const [status, setStatus] = useState({ loading: true, error: "" });
  const [aiEnabled, setAiEnabled] = useState(false);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const user = getCurrentUser();

  useEffect(() => {
    getAiStatus().then(setAiEnabled).catch(() => setAiEnabled(false));
  }, []);

  useEffect(() => {
    if (!hostelId) {
      setStatus({ loading: false, error: "This link is missing the hostel id." });
      return;
    }
    getPublicHostel(hostelId)
      .then((hostel) => {
        setHostelDetails(toHostelDetails(hostel));
        setStatus({ loading: false, error: "" });
      })
      .catch((error) => setStatus({ loading: false, error: getErrorMessage(error, "We couldn't load this hostel.") }));
  }, [hostelId]);

  if (status.loading && !hostelDetails) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress aria-label="Loading hostel" />
      </Box>
    );
  }
  if (status.error) {
    return (
      <Container sx={{ py: 3 }}>
        <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => navigate("/hostellist")}>Browse hostels</Button>}>
          {status.error}
        </Alert>
      </Container>
    );
  }

  const d = hostelDetails;
  const canBook = user?.userType !== "hostelOwner" && user?.userType !== "admin";
  const handleBook = () => {
    if (!user) {
      navigate("/login", { state: [d, { userType: "hostelUser" }] });
    } else {
      navigate("/bookinghostel", { state: d });
    }
  };

  const actions = (
    <>
      <Button variant="contained" fullWidth onClick={() => setInquiryOpen(true)}>Ask the owner</Button>
      {canBook && (
        <Button variant="outlined" fullWidth onClick={handleBook} disabled={d.hasVacancy === false}>
          {d.hasVacancy === false ? "No vacancy" : "Book hostel"}
        </Button>
      )}
    </>
  );

  return (
    // Extra bottom padding on phones so the sticky action bar never covers content.
    <Container maxWidth="lg" sx={{ py: 3, pb: { xs: 12, md: 4 } }}>
      <Paper variant="outlined" sx={{ overflow: "hidden", mb: 3 }}>
        <Carousel animation="slide" autoPlay={false}>
          {d.image.map((image, index) => (
            <img key={index} src={imageSrc(image)} alt={`${d.name} ${index + 1}`}
              style={{ height: "clamp(220px, 40vw, 400px)", objectFit: "cover", width: "100%", display: "block" }} />
          ))}
        </Carousel>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Typography variant="h3" component="h1" sx={{ fontSize: { xs: "1.8rem", md: "2.6rem" }, fontWeight: 700 }}>{d.name}</Typography>
          <Stack direction="row" spacing={1} mt={1} mb={2} flexWrap="wrap" useFlexGap>
            {d.isVerified && <Chip icon={<VerifiedIcon />} label="Verified listing" color="success" size="small" />}
            {d.hasVacancy === false
              ? <Chip label="Currently full" color="warning" size="small" />
              : d.hasVacancy && <Chip label="Rooms available" color="primary" variant="outlined" size="small" />}
            {d.allowGender && <Chip label={genderLabel(d.allowGender)} size="small" variant="outlined" />}
            <Chip icon={<StarIcon sx={{ color: "orange !important" }} />} size="small" variant="outlined"
              label={d.reviewCount ? `${d.rating} (${d.reviewCount})` : "No reviews yet"} />
          </Stack>

          <Stack spacing={1} mb={3}>
            <Typography><LocationOnIcon fontSize="small" sx={{ verticalAlign: "middle", mr: 1 }} />
              {[d.address?.street, d.address?.city, d.address?.state].filter(Boolean).join(", ")}</Typography>
            <Typography><PersonIcon fontSize="small" sx={{ verticalAlign: "middle", mr: 1 }} />{d.ownerName}</Typography>
            <Typography><PhoneIcon fontSize="small" sx={{ verticalAlign: "middle", mr: 1 }} />
              <a href={`tel:${d.contactPhn}`}>{d.contactPhn}</a></Typography>
            <Typography sx={{ wordBreak: "break-all" }}><EmailIcon fontSize="small" sx={{ verticalAlign: "middle", mr: 1 }} />
              <a href={`mailto:${d.email}`}>{d.email}</a></Typography>
          </Stack>

          {d.description && (
            <Box mb={3}>
              <Typography variant="h6" component="h2" gutterBottom>About</Typography>
              <Typography sx={{ whiteSpace: "pre-wrap" }}>{d.description}</Typography>
            </Box>
          )}

          {d.roomTypes && (
            <Box mb={3}>
              <Typography variant="h6" component="h2" gutterBottom>Rooms</Typography>
              <Paper variant="outlined" sx={{ overflowX: "auto" }}>
                <Table size="small" aria-label="Room types">
                  <TableBody>
                    {ROOM_TYPES.map((room) => {
                      const available = d.roomTypes.includes(room.id);
                      return (
                        <TableRow key={room.id}>
                          <TableCell sx={{ fontWeight: 500 }}>{room.label}</TableCell>
                          <TableCell align="right">
                            {available
                              ? <Chip icon={<CheckIcon />} label="Offered" size="small" color="success" variant="outlined" />
                              : <Chip icon={<RemoveIcon />} label="Not offered" size="small" variant="outlined" />}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Paper>
              {d.totalRooms && (
                <Typography variant="caption" color="text.secondary">{d.totalRooms} rooms in total · rent from ₹{formatRent(d.rent)}/month</Typography>
              )}
            </Box>
          )}

          <Box mb={3}>
            <Typography variant="h6" component="h2" gutterBottom>Facilities</Typography>
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {d.facilities.map((facility) => (
                <Chip key={facility} label={facility} variant="outlined" color="primary" />
              ))}
            </Stack>
          </Box>

          {d.houseRules && (
            <Box mb={3}>
              <Typography variant="h6" component="h2" gutterBottom>House rules</Typography>
              <Typography sx={{ whiteSpace: "pre-wrap" }}>{d.houseRules}</Typography>
            </Box>
          )}
        </Grid>

        {/* Desktop: sticky action card */}
        <Grid item md={4} sx={{ display: { xs: "none", md: "block" } }}>
          <Card variant="outlined" sx={{ position: "sticky", top: 16 }}>
            <CardContent>
              <Typography variant="h5" fontWeight={700}>
                ₹{formatRent(d.rent)}<Typography component="span" color="text.secondary"> /month</Typography>
              </Typography>
              <Stack spacing={1} mt={2}>{actions}</Stack>
              <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                The owner replies to your email. No payment is taken here.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {aiEnabled && hostelId && (
          <Grid item xs={12}>
            <AiInsightsCard hostelId={hostelId} />
          </Grid>
        )}
        {hostelId && (
          <Grid item xs={12}>
            <ReviewsSection hostelId={hostelId} />
          </Grid>
        )}
      </Grid>

      {/* Mobile: sticky bottom action bar */}
      <Paper elevation={8} sx={{
        display: { xs: "flex", md: "none" }, position: "fixed", left: 0, right: 0, bottom: 0,
        zIndex: (theme) => theme.zIndex.appBar, p: 1.5, gap: 1, alignItems: "center",
      }}>
        <Box flexShrink={0} mr={1}>
          <Typography fontWeight={700}>₹{formatRent(d.rent)}</Typography>
          <Typography variant="caption" color="text.secondary">per month</Typography>
        </Box>
        <Stack direction="row" spacing={1} flex={1}>{actions}</Stack>
      </Paper>

      <InquiryDialog open={inquiryOpen} onClose={() => setInquiryOpen(false)} hostelId={hostelId} hostelName={d.name} />
    </Container>
  );
};

export default ShowHostelDetails;

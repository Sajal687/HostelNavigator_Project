/* eslint-disable react-hooks/exhaustive-deps */

import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import Carousel from "react-material-ui-carousel";
import SearchIcon from "@mui/icons-material/Search";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import TuneIcon from "@mui/icons-material/Tune";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import KeyOutlinedIcon from "@mui/icons-material/KeyOutlined";
import AddHomeWorkOutlinedIcon from "@mui/icons-material/AddHomeWorkOutlined";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import { AuthUserContext , ActivePageContext } from "../../App";
import { EMPTY_FILTERS } from "../search/HostelSearchPanel";
import { ROOM_TYPES } from "../../constants/listing";
import { getAiStatus } from "../../services/aiService";
import { tokens } from "../../theme";


const testimonials = [
  {
    Name: "Ravi Sharma",
    Identity: "Hostel Owner",
    Testimonial:
      "I've been using this hostel management application for months now, and it has made my life so much easier. It helps me efficiently manage bookings, track occupancy rates, and communicate with my guests. Highly recommended!",
  },
  {
    Name: "Kishan Rastogi",
    Identity: "Hostel User",
    Testimonial:
      "As a frequent traveler, I rely on this application to find and book the best hostels. The user interface is intuitive, and the search filters make it easy to find hostels that meet my preferences. It has become my go-to platform for hostel bookings.",
  },
  {
    Name: "Tanmay Ratore",
    Identity: "Hostel Owner",
    Testimonial:
      "I love how this application streamlines the entire booking process. From managing room availability to handling payments, it simplifies everything. It saves me time and allows me to focus on providing the best experience for my guests.",
  },
  {
    Name: "Adarsh Agrawal",
    Identity: "Hostel User",
    Testimonial:
      "Finding a suitable hostel has never been easier. With this application, I can browse through various hostels, read reviews, and compare prices. It has helped me find comfortable and budget-friendly accommodations during my travels.",
  },
  {
    Name: "Shubham Nema",
    Identity: "Hostel Owner",
    Testimonial:
      "This hostel management application has transformed the way I run my business. It provides comprehensive analytics and reports, allowing me to make data-driven decisions. I can't imagine managing my hostel without it.",
  },
  {
    Name: "Rahul Mishra",
    Identity: "Hostel User",
    Testimonial:
      "I appreciate the user-friendly interface of this application. It makes the booking process hassle-free, and I can easily modify my reservations if needed. It has become my trusted companion for all my hostel bookings.",
  },
  {
    Name: "Vishal Verma",
    Identity: "Hostel Owner",
    Testimonial:
      "The customer support team behind this application is exceptional. They are responsive, knowledgeable, and always ready to assist. Their prompt assistance has helped me resolve any issues quickly and efficiently.",
  },
  {
    Name: "Vikas Dubey",
    Identity: "Hostel User",
    Testimonial:
      "I've had great experiences using this application for my hostel bookings. It provides detailed information about each hostel, including amenities, location, and photos. It helps me make informed decisions and ensures a comfortable stay.",
  },
  {
    Name: "Navneet Nema",
    Identity: "Hostel Owner",
    Testimonial:
      "This application has increased the visibility of my hostel. The listing features and promotional tools have helped attract more guests. It's an invaluable tool for marketing and expanding my business.",
  },
  {
    Name: "Sumit Rajput",
    Identity: "Hostel User",
    Testimonial:
      "I'm impressed with the seamless booking experience offered by this application. It securely processes payments and sends instant booking confirmations. It gives me peace of mind knowing that my reservation is secured.",
  },
];


const features = [
  {
    title:"User-Friendly Hostel Search",
    description:"The application provides a user-friendly interface for hostel users to search for hostels based on their preferred location, dates, and other filters. It makes it easy for users to find suitable accommodations quickly."
  },
  {
    title:"Online Booking and Reservation Management",
    description:" Hostel users can make online bookings directly through the application, ensuring a seamless reservation experience. Hostel owners can manage these bookings efficiently, view availability, and easily update reservation details."
  },
  {
    title:"Comprehensive Hostel Information",
    description:"The application provides detailed information about each hostel, including descriptions, photos, amenities, and user reviews. This enables hostel users to make informed decisions and choose the best hostel for their needs."
  },
  {
    title:"Real-Time Availability and Pricing",
    description:"Hostel owners can update their hostel's availability and pricing in real-time through the application. This ensures that hostel users always see the most up-to-date information and helps hostel owners maximize their occupancy rates."
  },
];

const BUDGETS = [
  { id: "any", label: "Any budget", minRent: "", maxRent: "" },
  { id: "u5", label: "Under ₹5,000", minRent: "", maxRent: 5000 },
  { id: "5-8", label: "₹5,000 – ₹8,000", minRent: 5000, maxRent: 8000 },
  { id: "8-12", label: "₹8,000 – ₹12,000", minRent: 8000, maxRent: 12000 },
  { id: "12+", label: "₹12,000+", minRent: 12000, maxRent: "" },
];

const POPULAR_CITIES = ["Indore", "Bhopal", "Kota", "Pune", "Delhi"];
const AI_EXAMPLES = [
  "Single room near coaching under ₹8k",
  "Girls PG in Indore with food and laundry",
  "Co-ed hostel with library, budget 10k",
];

const trustPoints = [
  { icon: <VerifiedOutlinedIcon />, title: "Verified listings", text: "Our team checks listings and marks them verified." },
  { icon: <RateReviewOutlinedIcon />, title: "Real student reviews", text: "Reviews from verified stays are labelled as such." },
  { icon: <ForumOutlinedIcon />, title: "Talk to owners directly", text: "Ask questions and book without middlemen." },
];

const steps = [
  { icon: <ManageSearchIcon />, title: "Search your way", text: "Use filters or just describe what you need in plain words." },
  { icon: <FactCheckOutlinedIcon />, title: "Compare with confidence", text: "Rent, rooms, house rules, AI summaries and reviews in one place." },
  { icon: <KeyOutlinedIcon />, title: "Ask, book, move in", text: "Message the owner, send a booking request and get notified." },
];

const SectionHeading = ({ eyebrow, title, subtitle }) => (
  <Box textAlign="center" maxWidth={640} mx="auto" mb={{ xs: 4, md: 6 }}>
    <Typography variant="overline" color="primary">{eyebrow}</Typography>
    <Typography variant="h3" component="h2" sx={{ fontSize: { xs: "1.75rem", md: "2.25rem" }, mt: 0.5 }}>{title}</Typography>
    {subtitle && <Typography variant="body1" mt={1.5}>{subtitle}</Typography>}
  </Box>
);

const IconTile = ({ children }) => (
  <Box sx={{ width: 44, height: 44, borderRadius: 3, display: "grid", placeItems: "center", backgroundColor: tokens.primaryLight, color: "primary.main", flexShrink: 0 }}>
    {children}
  </Box>
);

const HeroSearch = ({ aiEnabled }) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState("filters");
  const [city, setCity] = useState("");
  const [roomType, setRoomType] = useState("");
  const [budget, setBudget] = useState("any");
  const [query, setQuery] = useState("");

  const goToResults = (state) => navigate("/hostellist", { state });

  const searchWithFilters = (overrides = {}) => {
    const selectedBudget = BUDGETS.find((b) => b.id === (overrides.budget ?? budget));
    const selectedRoom = overrides.roomType ?? roomType;
    goToResults({
      filters: {
        ...EMPTY_FILTERS,
        city: (overrides.city ?? city).trim(),
        roomTypes: selectedRoom ? [selectedRoom] : [],
        minRent: selectedBudget.minRent,
        maxRent: selectedBudget.maxRent,
      },
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (mode === "ai" && query.trim().length >= 3) {
      goToResults({ smartQuery: query.trim() });
    } else {
      searchWithFilters();
    }
  };

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      elevation={16}
      sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 5, border: `1px solid ${tokens.border}`, textAlign: "left" }}
    >
      {aiEnabled && (
        <ToggleButtonGroup size="small" exclusive value={mode} onChange={(_, value) => value && setMode(value)} sx={{ mb: 2 }} aria-label="Search mode">
          <ToggleButton value="filters"><TuneIcon fontSize="small" sx={{ mr: 0.75 }} />Filters</ToggleButton>
          <ToggleButton value="ai"><AutoAwesomeIcon fontSize="small" sx={{ mr: 0.75, color: "primary.main" }} />Ask AI</ToggleButton>
        </ToggleButtonGroup>
      )}

      {mode === "ai" ? (
        <>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <TextField
              fullWidth
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Try: Single room near coaching under ₹8k"
              inputProps={{ maxLength: 500, "aria-label": "Describe the place you want" }}
              InputProps={{ startAdornment: <InputAdornment position="start"><AutoAwesomeIcon color="primary" /></InputAdornment> }}
            />
            <Button type="submit" variant="contained" size="large" startIcon={<SearchIcon />} sx={{ minWidth: 140, py: 1.5 }} disabled={query.trim().length < 3}>
              Search
            </Button>
          </Stack>
          <Stack direction="row" flexWrap="wrap" gap={1} mt={1.5}>
            {AI_EXAMPLES.map((example) => (
              <Chip key={example} label={example} size="small" variant="outlined" onClick={() => setQuery(example)} sx={{ cursor: "pointer" }} />
            ))}
          </Stack>
        </>
      ) : (
        <>
          <Grid container spacing={1.5} alignItems="stretch">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="City"
                placeholder="e.g. Indore"
                InputLabelProps={{ shrink: true }}
                value={city}
                onChange={(e) => setCity(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><PlaceOutlinedIcon fontSize="small" /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <FormControl fullWidth>
                <InputLabel id="hero-room" shrink>Room type</InputLabel>
                <Select labelId="hero-room" label="Room type" value={roomType} onChange={(e) => setRoomType(e.target.value)} displayEmpty notched>
                  <MenuItem value="">Any room</MenuItem>
                  {ROOM_TYPES.map((room) => <MenuItem key={room.id} value={room.id}>{room.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={3}>
              <FormControl fullWidth>
                <InputLabel id="hero-budget">Budget</InputLabel>
                <Select labelId="hero-budget" label="Budget" value={budget} onChange={(e) => setBudget(e.target.value)}>
                  {BUDGETS.map((b) => <MenuItem key={b.id} value={b.id}>{b.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button type="submit" variant="contained" size="large" fullWidth startIcon={<SearchIcon />} sx={{ height: "100%", minHeight: 52 }}>
                Search
              </Button>
            </Grid>
          </Grid>
          <Stack direction="row" alignItems="center" flexWrap="wrap" gap={1} mt={1.5}>
            <Typography variant="caption" sx={{ mr: 0.5 }}>Popular:</Typography>
            {POPULAR_CITIES.map((name) => (
              <Chip key={name} label={name} size="small" variant="outlined" icon={<PlaceOutlinedIcon />}
                onClick={() => searchWithFilters({ city: name })} sx={{ cursor: "pointer" }} />
            ))}
            <Chip label="Single room" size="small" variant="outlined" onClick={() => searchWithFilters({ roomType: "single" })} sx={{ cursor: "pointer" }} />
            <Chip label="Under ₹5k" size="small" variant="outlined" onClick={() => searchWithFilters({ budget: "u5" })} sx={{ cursor: "pointer" }} />
          </Stack>
        </>
      )}
    </Paper>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const {loggedIn} = useContext(AuthUserContext);
  const {setRemoveActiveStyle} = useContext(ActivePageContext);
  const [aiEnabled, setAiEnabled] = useState(false);

  useEffect(()=>{
    setRemoveActiveStyle(false);
    getAiStatus().then(setAiEnabled).catch(() => setAiEnabled(false));
  },[]);

  const goOwner = () => {
    setRemoveActiveStyle(true);
    navigate("/login", { state: [{}, { userType: "hostelOwner" }] });
  };

  return (
    <>
      {/* Hero */}
      <Box
        component="section"
        sx={{
          position: "relative",
          overflow: "hidden",
          background: `radial-gradient(1200px 500px at 85% -10%, ${tokens.primaryLight} 0%, transparent 60%),
                       radial-gradient(800px 400px at -10% 30%, ${tokens.successLight} 0%, transparent 55%),
                       ${tokens.background}`,
          borderBottom: `1px solid ${tokens.border}`,
        }}
      >
        <Container maxWidth="md" sx={{ pt: { xs: 6, md: 10 }, pb: { xs: 6, md: 9 }, textAlign: "center" }}>
          <Chip
            icon={<VerifiedOutlinedIcon />}
            label="Verified student housing · AI-powered search"
            color="success"
            sx={{ mb: 3, fontWeight: 600, px: 0.5 }}
          />
          <Typography variant="h1" sx={{ fontSize: { xs: "2.1rem", sm: "2.75rem", md: "3.5rem" }, mb: 2 }}>
            Find Your Next Student Home{" "}
            <Box component="span" sx={{ color: "primary.main" }}>Near Campus</Box>
          </Typography>
          <Typography variant="body1" sx={{ fontSize: { xs: "1rem", md: "1.15rem" }, maxWidth: 620, mx: "auto", mb: { xs: 4, md: 5 } }}>
            Browse verified hostels and PGs, compare rent, rooms and house rules, read real student reviews,
            or simply tell our AI what you're looking for.
          </Typography>
          <HeroSearch aiEnabled={aiEnabled} />
        </Container>
      </Box>

      {/* Trust strip */}
      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 6 } }}>
        <Grid container spacing={3}>
          {trustPoints.map((point) => (
            <Grid item xs={12} md={4} key={point.title}>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <IconTile>{point.icon}</IconTile>
                <Box>
                  <Typography variant="subtitle1" color="text.primary" fontWeight={700}>{point.title}</Typography>
                  <Typography variant="body2">{point.text}</Typography>
                </Box>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* How it works */}
      <Box component="section" sx={{ backgroundColor: tokens.white, borderTop: `1px solid ${tokens.border}`, borderBottom: `1px solid ${tokens.border}` }}>
        <Container maxWidth="lg" sx={{ py: { xs: 7, md: 10 } }}>
          <SectionHeading eyebrow="How it works" title="From search to move-in in three steps" />
          <Grid container spacing={3}>
            {steps.map((step, index) => (
              <Grid item xs={12} md={4} key={step.title}>
                <Card sx={{ height: "100%", p: 1 }}>
                  <CardContent>
                    <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
                      <IconTile>{step.icon}</IconTile>
                      <Typography variant="overline" color="text.secondary">Step {index + 1}</Typography>
                    </Stack>
                    <Typography variant="h6" component="h3" gutterBottom>{step.title}</Typography>
                    <Typography variant="body2">{step.text}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features */}
      <Container maxWidth="lg" sx={{ py: { xs: 7, md: 10 } }}>
        <SectionHeading eyebrow="Features" title="Everything you need to choose well" />
        <Grid container spacing={3}>
          {features.map((feature) => (
            <Grid item xs={12} sm={6} md={3} key={feature.title}>
              <Card sx={{ height: "100%", transition: "transform 150ms ease, box-shadow 150ms ease", "&:hover": { transform: "translateY(-2px)", boxShadow: 3 } }}>
                <CardContent>
                  <Typography variant="subtitle1" component="h3" color="text.primary" fontWeight={700} gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2">{feature.description.trim()}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Testimonials */}
      <Box component="section" sx={{ backgroundColor: tokens.surfaceMuted }}>
        <Container maxWidth="md" sx={{ py: { xs: 7, md: 10 } }}>
          <SectionHeading eyebrow="Testimonials" title="What students and owners say" />
          <Carousel indicators navButtonsAlwaysInvisible={false} animation="fade" interval={6000}
            indicatorIconButtonProps={{ style: { color: tokens.border, padding: 4 } }}
            activeIndicatorIconButtonProps={{ style: { color: tokens.primary } }}>
            {testimonials.map((testimonial) => (
              <Card key={testimonial.Name} sx={{ mx: { xs: 0, sm: 6 }, p: { xs: 1, sm: 2 } }}>
                <CardContent>
                  <FormatQuoteIcon sx={{ color: "primary.light", fontSize: 36 }} />
                  <Typography variant="body1" sx={{ fontSize: { md: "1.05rem" }, color: tokens.heading, minHeight: { sm: 110 } }}>
                    {testimonial.Testimonial}
                  </Typography>
                  <Stack direction="row" spacing={1.5} alignItems="center" mt={3}>
                    <Avatar sx={{ bgcolor: tokens.primaryLight, color: "primary.main", fontWeight: 700 }}>{testimonial.Name.charAt(0)}</Avatar>
                    <Box>
                      <Typography variant="subtitle2" color="text.primary">{testimonial.Name}</Typography>
                      <Typography variant="caption">{testimonial.Identity}</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Carousel>
        </Container>
      </Box>

      {/* Owner CTA */}
      {!loggedIn && (
        <Container maxWidth="lg" sx={{ py: { xs: 7, md: 10 } }}>
          <Paper
            sx={{
              p: { xs: 3, md: 6 },
              borderRadius: 6,
              color: "#fff",
              background: `linear-gradient(135deg, ${tokens.primary} 0%, #312e81 100%)`,
            }}
          >
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={8}>
                <Typography variant="h4" component="h2" sx={{ color: "#fff", fontSize: { xs: "1.6rem", md: "2.1rem" } }}>
                  Own a hostel or PG?
                </Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.85)", mt: 1 }}>
                  List it for free, get inquiries from students nearby and manage bookings, reviews and vacancies from one dashboard.
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Stack direction={{ xs: "column", sm: "row", md: "column" }} spacing={1.5}>
                  <Button size="large" startIcon={<AddHomeWorkOutlinedIcon />} onClick={goOwner}
                    sx={{ backgroundColor: "#fff", color: "primary.main", "&:hover": { backgroundColor: tokens.primaryLight } }}>
                    List your hostel
                  </Button>
                  <Button size="large" onClick={() => { setRemoveActiveStyle(true); navigate("/hostellist", { state: { userType: "hostelUser" } }); }}
                    sx={{ color: "#fff", border: "1px solid rgba(255,255,255,0.4)", "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" } }}>
                    I'm a student
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Paper>
        </Container>
      )}
    </>
  );
};

export default Home;

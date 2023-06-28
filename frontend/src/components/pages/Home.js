import React, { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Box, Typography, Button, Container, Grid , Card , CardContent,} from "@mui/material";
import Carousel from "react-material-ui-carousel";
import {useContext} from 'react';
import { AuthUserContext , ActivePageContext } from "../../App";


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



const Home = () => {
  const {loggedIn , setLoggedIn} = useContext(AuthUserContext);
  const {removeActiveStyle , setRemoveActiveStyle} = useContext(ActivePageContext);

  useEffect(()=>{
    setRemoveActiveStyle(false);
  },[]);
  
  return (
    <Container maxWidth="lg">
      <Box py={2} textAlign="center">
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to Hostel Navigator
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Find the perfect hostel or manage your hostel easily!
        </Typography>
      </Box>

      {
        !loggedIn && 
       <Box py={4} textAlign="center">
        <Container maxWidth="md">
          <Typography variant="h4" gutterBottom>
            Get Started
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Choose your role to continue:
          </Typography>


          <Grid container spacing={2} justifyContent="center" mt={2}>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                component={RouterLink}
                to="/login"
                state={[{}, { userType: "hostelOwner" }]}
                onClick={()=>setRemoveActiveStyle(true)}
              >
                Hostel Owner
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                component={RouterLink}
                to="/hostellist"
                state={{ userType: "hostelUser" }}
                onClick={()=>setRemoveActiveStyle(true)}
              >
                Student
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>
      }

      {/* Features section */}
      <Box py={4}>
      <Container maxWidth="lg" >
        <Typography variant="h4" gutterBottom>
          Features
        </Typography>
        <Grid container spacing={2}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ display: "flex", flexDirection: "column", height: "100%",}}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
      </Box>

          <Typography variant="h4" gutterBottom>
            Testimonials
          </Typography>
      <Box py={4} textAlign="center" bgcolor="#f7f7f7">
        <Container maxWidth="md">
          <Carousel>
            {testimonials.map((testimonial, index) => (
              <Typography key={index} variant="body1" color="textSecondary">
                "{testimonial.Name}" <br /> {testimonial.Identity}
                <br />- {testimonial.Testimonial}
              </Typography>
            ))}
          </Carousel>
        </Container>
      </Box>

    </Container>
  );
};

export default Home;

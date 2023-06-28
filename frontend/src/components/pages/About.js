import React from 'react';
import { Container, Typography, Grid, Box } from '@mui/material';

const AboutUs = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h2" gutterBottom>
        About Us
      </Typography>
      <Typography variant="body1" component="p" sx={{ mb: 2 }}>
        Welcome to our application! We are dedicated to providing the best hostel services
        and creating a seamless experience for both hostel owners and residents.
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={12} sm={6} sx={{borderRight:"1px dashed black" , pr:3}}>
          <Typography variant="h6" component="h3" gutterBottom>
            Our Mission
          </Typography>
          <Typography variant="body1" component="p" sx={{ mb: 2 }}>
            At HostelNavigator, our mission is to provide comfortable and affordable accommodation for students and young
            professionals. We strive to create a welcoming and inclusive environment that fosters personal growth and
            community engagement.
          </Typography>
          <Typography variant="body1" component="p" sx={{ mb: 2 }}>
            With a focus on quality, safety, and convenience, we aim to exceed the expectations of our residents and
            become their preferred choice for hostel accommodation.
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="h6" component="h3" gutterBottom>
            Our Values
          </Typography>
          <Box component="ul" sx={{ pl: 3 }}>
            <Typography variant="body1" component="li" gutterBottom>
              Commitment to Excellence: We are committed to delivering exceptional service and maintaining high standards
              in all aspects of our operations.
            </Typography>
            <Typography variant="body1" component="li" gutterBottom>
              Community and Diversity: We celebrate diversity and foster a sense of belonging among our residents,
              promoting an inclusive community spirit.
            </Typography>
            <Typography variant="body1" component="li" gutterBottom>
              Innovation and Improvement: We continuously strive for innovation and improvement to enhance the
              experience of our residents and stay at the forefront of the industry.
            </Typography>
            <Typography variant="body1" component="li">
              Sustainability: We are committed to implementing sustainable practices and reducing our environmental
              impact, contributing to a greener future.
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AboutUs;

import React from 'react';
import { Container, Typography, Grid, Box, Button } from '@mui/material';

const ContactUs = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h2" gutterBottom>
        Contact Us
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography variant="h6" component="h3" gutterBottom>
            Reach Out to Us
          </Typography>
          <Typography variant="body1" component="p" sx={{ mb: 2 }}>
            We are always here to assist you. Feel free to get in touch with us for any inquiries or support.
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Button variant="contained" color="primary" href="hostelbuddyservices@gmail.com">
              Email Us : hostelbuddyservices@gmail.com
            </Button>
            <Button variant="outlined" color="primary" sx={{ mt: 2 }} href="tel:+91999999999">
              Call Us
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} sx={{justifyContent:"right" , textAlign:"right"}}>
          <Typography variant="h6" component="h3" gutterBottom>
            Office Address
          </Typography>
          <Typography variant="body1" component="p">
            1234 Main Street,
            <br />
           Gadarwara, Country India
            <br />
            Postal Code: 487551
          </Typography>
          <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 4 }}>
            Office Hours
          </Typography>
          <Typography variant="body1" component="p">
            Monday to Friday: 9:00 AM - 5:00 PM
            <br />
            Saturday and Sunday: Closed
          </Typography>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ContactUs;

import React from 'react';
import { Container, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const FAQs = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h2" gutterBottom>
        FAQs
      </Typography>
      <Accordion sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="body1">How can I make a booking of particular hostel?</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2">
            To make a booking, go to the hostel listing page, select your desired hostel, and click on the "Book Now" button. Follow the instructions to complete the reservation process.
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="body1">How Can I make sure that my booking is successfully placed ?</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2">
            Once you fill out the necessary details , you will receive a popup for booking success message .          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="body1">How long I recieved my booking status?</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2">
            Our application will send notification to remind the owner about the available booking . It takes 0-6 days for the updated of your booking. </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="body1">Steps to register my hostel details in application?</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2">
           It's very easy to register your hostel , you first need to 'Register' as hostelOwner and then fill out the necessary details in the form.</Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="body1">What is hostelUser and hostelOwner term meaning when I go for signup ?</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2">
           This application can serve two kinds of users , first one is Owner of the hostel whome we denoted as 'hostelOwner' and second one is Student or User of this application whome we call as 'hostelUser'</Typography>
        </AccordionDetails>
      </Accordion>
    </Container>
  );
};

export default FAQs;

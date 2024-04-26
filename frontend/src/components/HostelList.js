import React, { useState, useEffect } from "react";
import Hostel from "./Hostel";
import axios from "axios";
import { Box, Typography, styled } from "@mui/material";
import {BASE_URL} from '../services/helper';

const Heading = styled(Typography)`
  font-size: 2.5rem;
  font-weight: bold;
  margin-top: 1.5rem;
  margin-bottom: 0.2rem;
  animation: slideIn 1s ease-in-out;
  
  @keyframes slideIn {
    from {
      transform: translateY(-20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  `;
  
  const Subheading = styled(Typography)`
    font-size: 1.2rem;
    margin-bottom: 1rem;
  `;
  
const HostelList = () => {
  const [hostels, setHostels] = useState(null);

  useEffect(() => {
    const fetchHostels = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/hostels`);
        const { data } = response.data;
        convertBufferToBase64(data);
      } catch (err) {
        console.log("Something went wrong");
      }
    };

    fetchHostels();
  }, []);

  const convertBufferToBase64 = (data) => {
    const updatedData = data.map((hostel) => {
      const base64Image = hostel.hostel_img.map((img) => {
        return arrayBufferToBase64(img.data.data);
      });
      return {
        ...hostel,
        hostel_img: base64Image,
      };
    });
    setHostels(updatedData);
  };

  const arrayBufferToBase64 = (arrayBuffer) => {
    let binary = "";
    const bytes = new Uint8Array(arrayBuffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };


  return (
    <>
      <Heading variant="h2" component="h1">
        Find Your Perfect Hostel
      </Heading>
      <Subheading variant="subtitle1">
        Browse through a wide range of hostels tailored for students.
      </Subheading>
      <Box width="100%">
        <Typography variant="h4" gutterBottom>
          Popular Hostels
        </Typography>
        <Typography variant="body1">
          Check out some of the highly-rated hostels preferred by students here.
        </Typography>
      </Box>
    <Box
      display="grid"
      gridTemplateColumns="repeat(auto-fill, minmax(300px, 1fr))"
      gap={2}
      justifyContent="center"
      alignItems="center"
      padding={2}
    >
      {hostels &&
        hostels.map((hostel) => (
          <Hostel
            key={hostel.id}
            hostel_id = {hostel.hostel_id}
            name={hostel.hostel_name}
            address={hostel.hostel_address}
            rent={hostel.hostel_rent}
            rating={hostel.hostel_rating}
            image={hostel.hostel_img}
            ownerName={hostel.owner_name}
            contactPhn={hostel.owner_phone_number}
            email={hostel.owner_email}
            allowGender={hostel.hostel_gender_type}
            facilities={hostel.hostel_facilities}
          />
        ))}
    </Box>
    </>
  );
};

export default HostelList;

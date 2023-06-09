import React, { useState } from "react";
import { Container, Typography, TextField, Button } from "@mui/material";
import axios from 'axios';

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handleGenderChange = (e) => {
    setGender(e.target.value);
  };

  const handlePhoneNumberChange = (e) => {
    setPhoneNumber(e.target.value);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };


  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:8080/register", {
        username,
        password,
        name,
        gender,
        phone_number: phoneNumber,
        email_address: email,
      });

      console.log("Username:", username);
      console.log("Password:", password);
      console.log("Name:", name);
      console.log("Gender:", gender);
      console.log("Phone Number:", phoneNumber);
      console.log("Email:", email);
      // Save the token to local storage or session storage
      localStorage.setItem("token", response.data.token);
      console.log(response.data.token)

      // Redirect to the protected page or update the user interface accordingly
      // ...
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Container
      sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <Typography variant="h4" component="h1" gutterBottom>
        Register
      </Typography>
      <form
        sx={{ display: "flex", flexDirection: "column", gap: 20, width: 300 }}
      >
        <TextField
          label="Username"
          value={username}
          onChange={handleUsernameChange}
          variant="outlined"
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={handlePasswordChange}
          variant="outlined"
        />
        <TextField
          label="Name"
          value={name}
          onChange={handleNameChange}
          variant="outlined"
        />
        <TextField
          label="Gender"
          value={gender}
          onChange={handleGenderChange}
          variant="outlined"
        />
        <TextField
          label="Phone Number"
          value={phoneNumber}
          onChange={handlePhoneNumberChange}
          variant="outlined"
        />
        <TextField
          label="Email"
          value={email}
          onChange={handleEmailChange}
          variant="outlined"
        />
        <Button variant="contained" color="primary" onClick={handleRegister}>
          Register
        </Button>
      </form>
    </Container>
  );
};

export default Register;

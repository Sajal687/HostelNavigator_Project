import React, { useState } from "react";
import { Container, Typography, TextField, Button } from "@mui/material";
import axios from 'axios';
// import { FormProvider, useForm, Controller } from "react-hook-form";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:8080/login", {
        username,
        password,
      });

      if (response.status === 200) {
        console.log(response.data.token);
      } else {
        console.log("Hey")
        // setMessage("Some error occurred");
      } 
      // Save the token to local storage or session storage
      localStorage.setItem("token", response.data.token);

      // Redirect to the protected page or update the user interface accordingly
      // ...
    } catch (error) {
      console.log(error);
    }
    console.log("Username:", username);
    console.log("Password:", password);
  };

  return (
    <Container
      sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <Typography variant="h4" component="h1" gutterBottom>
        Login
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
        <Button variant="contained" color="primary" onClick={handleLogin}>
          Login
        </Button>
      </form>
    </Container>
  );
};

export default Login;
/* eslint-disable no-unused-vars */
import React, { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import axios from "axios";
import {BASE_URL} from '../../services/helper';
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import FormControl from "@mui/material/FormControl";
import InputLabel  from "@mui/material/InputLabel";
import Select  from "@mui/material/Select";
import MenuItem  from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { AuthUserContext } from "../../App";


const defaultTheme = createTheme();

export default function SignUp() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const {loggedIn , setLoggedIn} = useContext(AuthUserContext);

  const navigate = useNavigate();
  const location = useLocation();
  console.log(location.state)
  let userType = location.state[1].userType;
  let hostelDetails = location.state[0];
  console.log(userType, hostelDetails);

  const handleSignup = async (data) => {
    if (userType === "hostelOwner") {
      toast.success("Now Please Complete your Hostel Profile");
      navigate("/createhostel", {
        state: {
          firstName: data.firstName,
          lastName: data.lastName,
          ownerEmail: data.email,
          ownerPhnNumber: data.PhoneNumber,
          password: data.password,
        },
      });
    } else {
      try {
        const response = await axios.post(`${BASE_URL}/register`, {
          email_address: data.email,
          password: data.password,
          name: `${data.firstName} ${data.lastName}`,
          gender: data.gender,
          phone_number: data.PhoneNumber,
        });

        if (response.status === 201) {
          toast.success("Successfully Register!");
          setLoggedIn(true);
          // console.log(response.data);
        } else {
          toast.error("Some error occurred");
        }

        localStorage.setItem("token", response.data.token);

        navigate(Object.keys(hostelDetails).length === 0 ? '/hostellist' : "/bookinghostel", { state: location.state.hostelDetails });
      } catch (error) {
        toast.error("Some Error Occured");
        // console.log(error);
      }
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign up
          </Typography>
          <Box
            component="form"
            noValidate
            onSubmit={handleSubmit(handleSignup)}
            sx={{ mt: 3 }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoComplete="given-name"
                  name="firstName"
                  required
                  fullWidth
                  id="firstName"
                  label="First Name"
                  autoFocus
                  {...register("firstName", { required: true })}
                  error={!!errors.firstName}
                  helperText={errors.firstName && "First Name is required"}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="lastName"
                  label="Last Name"
                  name="lastName"
                  autoComplete="family-name"
                  {...register("lastName", { required: true })}
                  error={!!errors.lastName}
                  helperText={errors.lastName && "Last Name is required"}
                />
              </Grid>
              {userType === "hostelUser" && (
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel id="gender">Gender</InputLabel>
                    <Select
                      labelId="gender"
                      id="gender"
                      label="Select Your Gender"
                      {...register("gender", { required: true })}
                      error={!!errors.gender}
                      helperText={errors.gender && "Please Select Your Gender"}
                    >
                      <MenuItem value={"Male"}>Male</MenuItem>
                      <MenuItem value={"Female"}>Female</MenuItem>
                      <MenuItem value={"Transgender"}>Transgender</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  {...register("email", { required: true })}
                  error={!!errors.email}
                  helperText={errors.email && "Email is required"}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="PhoneNumber"
                  label="Phone Number"
                  name="PhoneNumber"
                  autoComplete="PhoneNumber"
                  {...register("PhoneNumber", { required: true })}
                  error={!!errors.PhoneNumber}
                  helperText={errors.PhoneNumber && "Phone Number is required"}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  {...register("password", { required: true })}
                  error={!!errors.password}
                  helperText={errors.password && "Password is Required"}
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign Up
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link onClick={()=> navigate('/login' , {state : location.state })} variant="body2">
                  Already have an account? Sign in
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

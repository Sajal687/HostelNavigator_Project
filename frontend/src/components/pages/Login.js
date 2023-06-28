import React, { useContext } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import PersonIcon from "@mui/icons-material/Person";
import AddIcon from "@mui/icons-material/Add";
import { blue } from "@mui/material/colors";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import { AuthUserContext } from "../../App";

const defaultTheme = createTheme();

const possibleUsers = ["hostelUser", "hostelOwner"];

const Login = () => {
  const [open, setOpen] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();

  const location = useLocation();
  let hostelDetails = location.state[0];
  let userType = location.state[1].userType;

  const { loggedIn, setLoggedIn } = useContext(AuthUserContext);

  const handleLogin = async (data) => {
    try {
      const response = await axios.post("http://localhost:8080/login", {
        useremail: data.email,
        password: data.password,
      });

      if (response.status === 200) {
        toast.success("Successfully Login!");
        setLoggedIn(true);
      } else {
        toast.error("Some error occurred");
      }

      localStorage.setItem("token", response.data.token);

      if (
        (userType === "hostelOwner" || userType === "") &&
        response.data.roleName.rolename === "hostelOwner"
      ) {
        navigate("/ownerdashboard", { state: userType });
      } else if (
        (userType === "hostelUser" || userType === "") &&
        response.data.roleName.rolename === "hostelUser"
      ) {
        userType === ""
          ? navigate("/hostellist")
          : navigate("/bookinghostel", { state: hostelDetails });
      } else {
        console.log(response.data.roleName.rolename);
        console.log("No User Is Found By this Data");
      }
    } catch (error) {
      toast.error("Username and Password not matched");
      console.log(error);
    }
  };

  const handleSignup = () => {
    if (userType === "hostelOwner") {
      navigate("/register", {
        state: { userType: userType, hostelDetails: {} },
      });
    } else {
      navigate("/register", {
        state: { userType: userType, hostelDetails: hostelDetails },
      });
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleListItemClick = (value) => {
    setSelectedValue(value);
    userType = value;
    handleSignup();
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Grid container component="main" sx={{ height: "100vh" }}>
        <CssBaseline />
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage:
              "url(https://source.unsplash.com/random?wallpapers)",
            backgroundRepeat: "no-repeat",
            backgroundColor: (t) =>
              t.palette.mode === "light"
                ? t.palette.grey[50]
                : t.palette.grey[900],
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Sign in
            </Typography>
            <Box
              component="form"
              noValidate
              onSubmit={handleSubmit(handleLogin)}
              sx={{ mt: 1 }}
            >
              <TextField
                margin="normal"
                fullWidth
                id="email"
                label="UserName or Email Address"
                autoComplete="email"
                autoFocus
                {...register("email", { required: true })}
                error={!!errors.email}
                helperText={errors.email && "Email is required"}
              />
              <TextField
                margin="normal"
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                {...register("password", { required: true })}
                error={!!errors.password}
                helperText={errors.password && "Password is required"}
              />
              <FormControlLabel
                control={<Checkbox value="remember" color="primary" />}
                label="Remember me"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Sign In
              </Button>
              <Grid container>
                <Grid item xs>
                  <Link href="" variant="body2">
                    Forgot password?
                  </Link>
                </Grid>
                <Grid item>
                  <Dialog onClose={handleClose} open={open}>
                    <DialogTitle>Sign Up As </DialogTitle>
                    <List sx={{ pt: 0 }}>
                      {possibleUsers.map((possibleUser) => (
                        <ListItem disableGutters>
                          <ListItemButton
                            onClick={() => handleListItemClick(possibleUser)}
                            key={possibleUser}
                          >
                            <ListItemAvatar>
                              <Avatar
                                sx={{ bgcolor: blue[100], color: blue[600] }}
                              >
                                <PersonIcon />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText primary={possibleUser} />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  </Dialog>

                  <Link
                    variant="body2"
                    onClick={userType === "" ? handleClickOpen : handleSignup}
                    sx={{ cursor: "pointer" }}
                  >
                    {"Don't have an account? Sign Up"}
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
};

export default Login;

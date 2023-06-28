/* eslint-disable-next-line react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef , useContext } from "react";
import axios from "axios";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Link from "@mui/material/Link";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Badge from "@mui/material/Badge";
import MailIcon from "@mui/icons-material/Mail";
import Tooltip from "@mui/material/Tooltip";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Popper from "@mui/material/Popper";
import logo from "../../assets/logo7.png";
import { BASE_URL } from "../../services/helper";

import { useNavigate } from "react-router-dom";
import { ActivePageContext, AuthUserContext } from "../../App";

const pages = ["Home" , "Hostels" , "AboutUs" , "ContactUs" , "FAQs"];
const settings = ["Logout"];

function NavigationBar() {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const [userDetails, setUserDetails] = useState({});
  const [userNameFirstWord, setUserNameFirstWord] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [countNotification, setCountNotification] = useState(0);
  const [showMessages, setShowMessages] = useState(false);
  const [activePage, setActivePage] = useState(pages[0]);
  const anchorRef = useRef(null);

  
  const {loggedIn , setLoggedIn} = useContext(AuthUserContext);
  const {removeActiveStyle , setRemoveActiveStyle} = useContext(ActivePageContext);
  const navigate = useNavigate();

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    settings.pop();
    setLoggedIn(false);
    navigate('/');
  };

  const handleDashboard = () => {
    navigate("/ownerdashboard", userDetails.userType);
  };

  const handleSettingClick = (setting) => {
    setRemoveActiveStyle(true);
    switch (setting) {
      case "Logout":
        handleLogout();
        handleNavLinkClick("Home");
        break;
      case "Dashboard":
        handleDashboard();
        break;
      default:
        break;
    }
    handleCloseUserMenu();
  };

  const handleLoginButton = () => {
    setRemoveActiveStyle(true);
    navigate("/login", { state: [{}, { userType: "" }] })
  }



  const handleNavLinkClick = (page) => {
    setRemoveActiveStyle(false);
    switch (page) {
      case "Home":
        navigate("/");
        setActivePage("Home");
        break;
      case "Hostels":
        navigate("/hostellist");
        setActivePage("Hostels");
        break;
      case "AboutUs":
        navigate("/about");
        setActivePage("AboutUs");
        break;
      case "ContactUs":
        navigate("/contact");
        setActivePage("ContactUs");
        break;
      case "FAQs":
        navigate("/faqs");
        setActivePage("FAQs");
        break;
      default:
        break;
    }
    handleCloseNavMenu();
  };
  

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleMailIconClick = () => {
    setShowMessages(!showMessages);
  };


  const token = localStorage.getItem("token");
  useEffect(() => {
    if (token) {
      const encodedPayload = token.split(".")[1];
      const decodedPayload = JSON.parse(window.atob(encodedPayload));

      setUserDetails(decodedPayload);
      setUserNameFirstWord(decodedPayload.userName.charAt(0).toUpperCase());

      //Add Dashboard Setting , If user is Hostel Owner
      if (decodedPayload.userType === "hostelOwner" && !settings.includes("Dashboard") ) {
        settings.push("Dashboard");
      }

      if (Object.keys(decodedPayload).length !== 0) {
        const TokenExpiry = decodedPayload.exp;
        const currentTime = new Date().getTime() / 1000;
        if (TokenExpiry < currentTime) {
          console.log(token);
          setLoggedIn(false);
        } else {
          setLoggedIn(true);
          const fetchNotification = async () => {
            const res = await axios.get(`${BASE_URL}/notification`, {
              params: {
                id: decodedPayload.id,
                userType: decodedPayload.userType,
              },
            });
            setNotifications(res.data.data);
            console.log(res.data);
            setCountNotification(
              res.data.data.length === 0 ?
              0 : 
              res.data.data.reduce((total, notification) => {
                    return total + Number(notification.markRead === "no");
              }, 0)
            );
          };
          fetchNotification();
        }
      }
    } else {
      console.log("No Token Found");
      setLoggedIn(false);
    }
  }, [loggedIn, token ]);

 

  const handleMarkAllRead = async () => {
    notifications.map((notification) => notification.markRead = "yes")
    setCountNotification(0);
    countNotification && await axios.put(`${BASE_URL}/updateReadStatus/${notifications[0].receiver}`);
  }

  return (
    <AppBar position="static" sx={{backgroundColor:"#09090a"}}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Link href="/">
            <Box
              component="img"
              sx={{
                height: 54,
                width: 54,
                display: { xs: "none", md: "flex" , borderRadius:"50%"},
                mr: 1,
              }}
              alt="Logo"
              src={logo}
            />
          </Link>
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: "none", md: "flex" },
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".2rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            HostelNavigator
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: "block", md: "none" },
              }}
            >
              {pages.map((page) => (
                <MenuItem key={page} onClick={() => handleNavLinkClick(page)}>
                  <Typography textAlign="center">{page}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          <Link href="/">
            <Box
              component="img"
              sx={{
                height: 54,
                width: 54,
                display: { xs: "flex", md: "none" , borderRadius:"50%"},
                mr: 1,
              }}
              alt="Logo"
              src={logo}
            />
          </Link>
          <Typography
            variant="h5"
            noWrap
            component="a"
            href=""
            sx={{
              mr: 2,
              display: { xs: "flex", md: "none" },
              flexGrow: 1,
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".01rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            HostelNavigator
          </Typography>
          <Box
            sx={{
              flexGrow: 1,
              alignItems: "center",
              justifyContent: "flex-end",
              display: { xs: "none", md: "flex" },
            }}
          >
            {pages.map((page) => (
              <Button
                key={page}
                onClick={() => handleNavLinkClick(page)}
                sx={{
                  border:"none",
                  height: 63,
                  mx: 2,
                  color: activePage === page && !removeActiveStyle ? 'blue' : 'white',
                  backgroundColor: activePage === page && !removeActiveStyle ? 'white' : '',
                  display: 'block',
                  '&:hover': {
                    backgroundColor: activePage === page && !removeActiveStyle ? 'white' : 'white', 
                    color: 'black', 
                  },
                }}
              >
                {page}
              </Button>
            ))}
          </Box>

          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            <IconButton
              size="large"
              aria-label="show new mails"
              color="inherit"
              onClick={handleMailIconClick}
              ref={anchorRef}
            >
              <Badge
                badgeContent={countNotification}
                color="error"
                sx={{ mr: 3 }}
                >
                <MailIcon onClick={handleMarkAllRead} />
              </Badge>
              <Popper
                open={showMessages}
                anchorEl={anchorRef.current}
                placement="bottom"
                disablePortal
                modifiers={[
                  {
                    name: "offset",
                    options: {
                      offset: [0, 10],
                    },
                  },
                ]}
                >
                <div>
                  <Card onClick = {handleMarkAllRead}
                    sx={{
                      marginBottom: "10px",
                      width: "300px",
                      overflowY: "auto",
                    }}
                  >
                    {notifications.map((notification, index) => (
                      <CardContent
                        key={index}
                        sx={{
                          fontSize: "14px",
                          textAlign: "left",
                          borderBottom: index !== notifications.length - 1 ? "1px dashed gray": "none",
                          paddingBottom: "10px",
                          backgroundColor: notification.markRead === "no" ? "#bdbdbd7d" : "#bdbdbd00",
                        }}
                      >
                        {notification.message}
                      </CardContent>
                    ))}
                  </Card>
                </div>
              </Popper>
            </IconButton>

            {loggedIn ? (
              <>
                <Tooltip title={userDetails.userName}>
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar
                      sx={{
                        bgcolor: "#21568f",
                        padding: "5px",
                        fontSize: "2rem",
                      }}
                    >
                      {userNameFirstWord}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: "45px" }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  {settings.map((setting) => (
                    <MenuItem
                      key={setting}
                      onClick={() => handleSettingClick(setting)}
                    >
                      <Typography textAlign="center">{setting}</Typography>
                    </MenuItem>
                  ))}
                </Menu>
              </>
            ) : (
              <Button
                onClick={() =>handleLoginButton()}
                sx={{ color: "white" }}
              >
                Login
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default NavigationBar;

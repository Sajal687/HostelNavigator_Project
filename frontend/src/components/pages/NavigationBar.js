/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef , useContext } from "react";
import axios from "axios";
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Popover,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import AddHomeWorkOutlinedIcon from "@mui/icons-material/AddHomeWorkOutlined";
import logo from "../../assets/logo7.png";
import { BASE_URL } from "../../services/helper";
import { tokens } from "../../theme";

import { useLocation, useNavigate } from "react-router-dom";
import { ActivePageContext, AuthUserContext } from "../../App";

const pages = [
  { key: "Home", label: "Home", path: "/" },
  { key: "Hostels", label: "Find hostels", path: "/hostellist" },
  { key: "AboutUs", label: "About", path: "/about" },
  { key: "FAQs", label: "FAQs", path: "/faqs" },
  { key: "ContactUs", label: "Contact", path: "/contact" },
];

// Account menu entries per role (derived, so nothing leaks between logins).
const settingsFor = (userType) => [
  ...(userType === "hostelOwner" ? ["Dashboard"] : []),
  ...(userType === "admin" ? ["Admin"] : []),
  "Logout",
];

// Listing pages count as "Find hostels" for the active-link highlight.
const activeKeyFor = (pathname) => {
  if (pathname === "/") return "Home";
  if (["/hostellist", "/hosteldetails", "/bookinghostel"].includes(pathname)) return "Hostels";
  return pages.find((page) => page.path === pathname)?.key || null;
};

export const Brand = ({ onClick, light = false }) => (
  <Box component="a" href="/" onClick={onClick} sx={{ display: "flex", alignItems: "center", gap: 1, textDecoration: "none", flexShrink: 0 }}>
    <Box component="img" src={logo} alt="" sx={{ height: 36, width: 36, borderRadius: "10px" }} />
    <Typography component="span" sx={{ fontWeight: 800, fontSize: "1.15rem", letterSpacing: "-0.02em", color: light ? "#fff" : tokens.heading }}>
      Hostel<Box component="span" sx={{ color: light ? "#a5b4fc" : "primary.main" }}>Navigator</Box>
    </Typography>
  </Box>
);

function NavigationBar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const [userDetails, setUserDetails] = useState({});
  const [userNameFirstWord, setUserNameFirstWord] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [countNotification, setCountNotification] = useState(0);
  const [showMessages, setShowMessages] = useState(false);
  const anchorRef = useRef(null);


  const {loggedIn , setLoggedIn} = useContext(AuthUserContext);
  const {setRemoveActiveStyle} = useContext(ActivePageContext);
  const navigate = useNavigate();
  const location = useLocation();
  const activeKey = activeKeyFor(location.pathname);
  const canListHostel = !loggedIn || userDetails.userType === "hostelUser";

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };


  const handleLogout = () => {
    localStorage.removeItem("token");
    setUserDetails({});
    setNotifications([]);
    setCountNotification(0);
    setShowMessages(false);
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
        break;
      case "Dashboard":
        handleDashboard();
        break;
      case "Admin":
        navigate("/admin");
        break;
      default:
        break;
    }
    handleCloseUserMenu();
  };

  const handleLoginButton = () => {
    setRemoveActiveStyle(true);
    setDrawerOpen(false);
    navigate("/login", { state: [{}, { userType: "" }] })
  }

  // Same entry point as the Home page's "Hostel Owner" button: owner login / sign-up.
  const handleListHostel = () => {
    setRemoveActiveStyle(true);
    setDrawerOpen(false);
    navigate("/login", { state: [{}, { userType: "hostelOwner" }] });
  };

  const handleNavLinkClick = (page) => {
    setRemoveActiveStyle(false);
    setDrawerOpen(false);
    navigate(page.path);
  };


  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleMailIconClick = () => {
    setShowMessages(!showMessages);
    handleMarkAllRead();
  };


  const token = localStorage.getItem("token");
  useEffect(() => {
    if (token) {
      const encodedPayload = token.split(".")[1];
      const decodedPayload = JSON.parse(window.atob(encodedPayload));

      setUserDetails(decodedPayload);
      setUserNameFirstWord(decodedPayload.userName.charAt(0).toUpperCase());

      if (Object.keys(decodedPayload).length !== 0) {
        const TokenExpiry = decodedPayload.exp;
        const currentTime = new Date().getTime() / 1000;
        if (TokenExpiry < currentTime) {
          // console.log(token);
          setLoggedIn(false);
        } else {
          setLoggedIn(true);
          const fetchNotification = async () => {
            let res;
            try {
              // Identity comes from the token (attached by apiClient), not query params.
              res = await axios.get(`${BASE_URL}/notification`);
            } catch (error) {
              return; // Notifications are non-critical; keep the navbar usable.
            }
            // Newest first.
            res.data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setNotifications(res.data.data);
            // console.log(res.data);
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
      setLoggedIn(false);
    }
  }, [loggedIn, token ]);



  const handleMarkAllRead = async () => {
    if (!countNotification) return;
    setCountNotification(0);
    try {
      await axios.put(`${BASE_URL}/updateReadStatus/${notifications[0].receiver}`);
    } catch (error) {
      // Non-critical: they'll show as unread again on the next load.
    }
  }

  return (
    <AppBar
      position="sticky"
      color="inherit"
      sx={{
        backgroundColor: "rgba(255, 255, 255, 0.85)",
        backdropFilter: "saturate(180%) blur(12px)",
        borderBottom: `1px solid ${tokens.border}`,
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ minHeight: { xs: 60, md: 68 }, gap: 1 }}>
          <Brand onClick={(e) => { e.preventDefault(); handleNavLinkClick(pages[0]); }} />

          {/* Desktop links */}
          <Stack direction="row" spacing={0.5} sx={{ display: { xs: "none", md: "flex" }, ml: 4, flexGrow: 1 }} component="nav" aria-label="Main">
            {pages.map((page) => {
              const active = activeKey === page.key;
              return (
                <Button
                  key={page.key}
                  onClick={() => handleNavLinkClick(page)}
                  aria-current={active ? "page" : undefined}
                  sx={{
                    color: active ? "primary.main" : tokens.body,
                    backgroundColor: active ? tokens.primaryLight : "transparent",
                    fontWeight: active ? 700 : 500,
                    px: 1.5,
                    "&:hover": { backgroundColor: active ? tokens.primaryLight : tokens.surfaceMuted, color: active ? "primary.main" : tokens.heading },
                  }}
                >
                  {page.label}
                </Button>
              );
            })}
          </Stack>
          <Box sx={{ flexGrow: 1, display: { xs: "block", md: "none" } }} />

          <Stack direction="row" spacing={1} alignItems="center">
            {canListHostel && (
              <Button
                variant="outlined"
                color="primary"
                startIcon={<AddHomeWorkOutlinedIcon />}
                onClick={handleListHostel}
                sx={{ display: { xs: "none", sm: "inline-flex" } }}
              >
                List your hostel
              </Button>
            )}

            {loggedIn && (
              <Tooltip title="Notifications">
                <IconButton
                  aria-label={`${countNotification} unread notifications`}
                  onClick={handleMailIconClick}
                  ref={anchorRef}
                  sx={{ color: tokens.body }}
                >
                  <Badge badgeContent={countNotification} color="error">
                    <NotificationsNoneIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
            )}

            {loggedIn ? (
              <>
                <Tooltip title={userDetails.userName || "Account"}>
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0.5 }} aria-label="Account menu">
                    <Avatar sx={{ bgcolor: "primary.main", width: 36, height: 36, fontSize: "1rem", fontWeight: 700 }}>
                      {userNameFirstWord}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: "8px" }}
                  id="menu-account"
                  anchorEl={anchorElUser}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  keepMounted
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  <Box px={2} py={1}>
                    <Typography variant="subtitle2">{userDetails.userName}</Typography>
                  </Box>
                  <Divider />
                  {settingsFor(userDetails.userType).map((setting) => (
                    <MenuItem key={setting} onClick={() => handleSettingClick(setting)}>
                      {setting}
                    </MenuItem>
                  ))}
                </Menu>
              </>
            ) : (
              <Button variant="contained" onClick={handleLoginButton} sx={{ display: { xs: "none", md: "inline-flex" } }}>
                Log in
              </Button>
            )}

            <IconButton
              aria-label="Open menu"
              onClick={() => setDrawerOpen(true)}
              sx={{ display: { xs: "inline-flex", md: "none" }, color: tokens.heading }}
            >
              <MenuIcon />
            </IconButton>
          </Stack>
        </Toolbar>
      </Container>

      <Popover
        open={showMessages}
        anchorEl={anchorRef.current}
        onClose={() => setShowMessages(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{ sx: { width: "min(340px, 92vw)", maxHeight: "60vh", mt: 1 } }}
      >
        <Box px={2} py={1.5} borderBottom={`1px solid ${tokens.border}`}>
          <Typography variant="subtitle2">Notifications</Typography>
        </Box>
        {notifications.length === 0 ? (
          <Typography variant="body2" px={2} py={3} textAlign="center" color="text.secondary">No notifications yet.</Typography>
        ) : (
          notifications.map((notification, index) => (
            <Box
              key={notification._id || index}
              px={2}
              py={1.5}
              sx={{
                borderBottom: index !== notifications.length - 1 ? `1px solid ${tokens.border}` : "none",
                backgroundColor: notification.markRead === "no" ? tokens.primaryLight : "transparent",
              }}
            >
              <Typography variant="body2" color="text.primary">{notification.message}</Typography>
              {notification.createdAt && (
                <Typography variant="caption">{new Date(notification.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</Typography>
              )}
            </Box>
          ))
        )}
      </Popover>

      {/* Mobile navigation */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)} PaperProps={{ sx: { width: "min(300px, 85vw)", borderRadius: "16px 0 0 16px" } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" px={2} py={1.5}>
          <Brand onClick={(e) => { e.preventDefault(); handleNavLinkClick(pages[0]); }} />
          <IconButton aria-label="Close menu" onClick={() => setDrawerOpen(false)}><CloseIcon /></IconButton>
        </Stack>
        <Divider />
        <List component="nav" aria-label="Main" sx={{ px: 1 }}>
          {pages.map((page) => (
            <ListItemButton
              key={page.key}
              selected={activeKey === page.key}
              onClick={() => handleNavLinkClick(page)}
              sx={{ borderRadius: 2, my: 0.25, "&.Mui-selected": { backgroundColor: tokens.primaryLight, color: "primary.main" } }}
            >
              <ListItemText primary={page.label} primaryTypographyProps={{ fontWeight: activeKey === page.key ? 700 : 500 }} />
            </ListItemButton>
          ))}
        </List>
        <Box px={2} pb={2} mt="auto">
          <Stack spacing={1}>
            {canListHostel && (
              <Button variant="outlined" color="primary" startIcon={<AddHomeWorkOutlinedIcon />} onClick={handleListHostel} fullWidth>
                List your hostel
              </Button>
            )}
            {!loggedIn && <Button variant="contained" onClick={handleLoginButton} fullWidth>Log in</Button>}
          </Stack>
        </Box>
      </Drawer>
    </AppBar>
  );
}
export default NavigationBar;

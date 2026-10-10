import React , {createContext , useState} from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Box } from "@mui/material";
import Footer from "./components/layout/Footer";

import CreateNewHostel from "./components/CreateNewHostel";
import HostelList from './components/HostelList';
import ShowHostelDetails from './components/ShowHostelDetails';
import Login from "./components/pages/Login";
import HostelBooking from "./components/HostelBooking";
import OwnerDashboard from "./components/OwnerDashboard";
import Home from './components/pages/Home';
import Register from './components/pages/Register';
import NavigationBar from "./components/pages/NavigationBar";
import ToasterNotification from "./components/notification/ToasterNotification";
import ColdStartBanner from "./components/notification/ColdStartBanner";
import ConciergeWidget from "./components/ai/ConciergeWidget";
import AdminDashboard from "./components/admin/AdminDashboard";
import AboutUs from "./components/pages/About";
import FAQs from "./components/pages/FAQs";
import ContactUs from "./components/pages/Contact";

export const AuthUserContext = createContext();
export const ActivePageContext = createContext();

const App = () => {
  const [loggedIn , setLoggedIn] = useState(false);
  const [removeActiveStyle , setRemoveActiveStyle] = useState(false);

  return (
    <>
    <Router>
    <ToasterNotification/>
    <ColdStartBanner/>
    <AuthUserContext.Provider value={{loggedIn , setLoggedIn}}>
    <ActivePageContext.Provider value={{removeActiveStyle , setRemoveActiveStyle}}>
    <NavigationBar/>
      <Box component="main" sx={{ flex: 1, width: "100%" }}>
      <Routes>
        <Route exact path='/' element={<Home/>} />
        <Route exact path="/hostellist" element={<HostelList/>} />
        <Route exact path="/hosteldetails" element={<ShowHostelDetails/>} />
        <Route exact path="/createhostel" element={<CreateNewHostel/>} />
        <Route exact path="/bookinghostel" element={<HostelBooking/>} />
        <Route exact path="/ownerdashboard" element={<OwnerDashboard/>} />
        <Route exact path="/admin" element={<AdminDashboard/>} />
        <Route exact path="/about" element={<AboutUs/>} />
        <Route exact path="/faqs" element={<FAQs/>} />
        <Route exact path="/contact" element={<ContactUs/>} />
        <Route exact path="/login" element={!loggedIn  ? <Login/> : <Home/>} />
        <Route exact path="/register" element={<Register/>} />
      </Routes>
      </Box>
      <Footer/>
      <ConciergeWidget/>
      </ActivePageContext.Provider>
    </AuthUserContext.Provider>
    </Router>
    </>
  );
};

export default App;

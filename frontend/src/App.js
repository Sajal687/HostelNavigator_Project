import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ShowSearchResult from "./components/ShowSearchResult";
import CreateNewHostel from "./components/CreateNewHostel";
import HostelList from './components/HostelList';
import ShowHostelDetails from './components/ShowHostelDetails';
import Login from "./components/Login";
import Register from "./components/Register";


// import Home from './pages/Home';
// import Hostels from './components/Hostels';
// import OwnerDashboard from './components/OwnerDashboard';
// import Feedback from './components/Feedback';
// import AddHostel from './components/AddHostel';
// import About from './pages/About';
// import NavigationBar from "./components/NavigationBar";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<HostelList/>} />
        <Route path="/hosteldetails" element={<ShowHostelDetails/>} />
        <Route path="/createhostel" element={<CreateNewHostel/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Register/>} />
      </Routes>
    </Router>
  );
};

export default App;

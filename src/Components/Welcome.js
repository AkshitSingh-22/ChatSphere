import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import logo from "../Images/live-chat.png";
import { motion } from "framer-motion";

function Welcome() {
  const lightTheme = useSelector((state) => state.themeKey);
  const userData = JSON.parse(localStorage.getItem("userData"));
  const navigate = useNavigate();

  if (!userData) {
    console.log("User not Authenticated");
    navigate("/"); // Redirect to login if not authenticated
    return null; // Prevent rendering if not authenticated
  }

  return (
    <div className={"welcome-container" + (lightTheme ? "" : " dark")}>
      <motion.img
        drag
        whileTap={{ scale: 1.05, rotate: 360 }}
        src={logo}
        alt="Logo"
        className="welcome-logo"
      />
      <b>Hi, {userData.name} 👋</b>
      <p>View and text directly to people present in the chat Rooms.</p>
    </div>
  );
}

export default Welcome;

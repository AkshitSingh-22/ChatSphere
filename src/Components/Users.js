import React, { useContext, useEffect, useState } from "react";
import "./myStyles.css";
import SearchIcon from "@mui/icons-material/Search";
import { IconButton } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import logo from "../Images/live-chat.png";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { refreshSidebarFun } from "../Features/refreshSidebar";
import { myContext } from "./MainContainer";

function Users() {
  const { refresh, setRefresh } = useContext(myContext);
  const lightTheme = useSelector((state) => state.themeKey);
  const [users, setUsers] = useState([]);
  const userData = JSON.parse(localStorage.getItem("userData"));

  const nav = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!userData) {
      console.log("User not authenticated");
      nav("/login");
      return;
    }

    const config = {
      headers: {
        Authorization: `Bearer ${userData.token}`,
      },
    };

    axios
      .get("http://localhost:8080/user/fetchUsers", config)
      .then((data) => {
        console.log("User data refreshed in Users panel");
        setUsers(data.data);
      })
      .catch((error) => {
        console.error("Failed to fetch users:", error);
      });
  }, [refresh]);

  if (!userData) return null; // Prevent rendering if not authenticated

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0 }}
        transition={{ duration: "0.3" }}
        className="list-container"
      >
        <div className={"ug-header" + (lightTheme ? "" : " dark")}>
          <img
            src={logo}
            alt="logo"
            style={{ height: "2rem", width: "2rem", marginLeft: "10px" }}
          />
          <p className={"ug-title" + (lightTheme ? "" : " dark")}>
            Available Users
          </p>
          <IconButton
            className={"icon" + (lightTheme ? "" : " dark")}
            onClick={() => setRefresh(!refresh)}
          >
            <RefreshIcon />
          </IconButton>
        </div>

        <div className={"sb-search" + (lightTheme ? "" : " dark")}>
          <IconButton className={"icon" + (lightTheme ? "" : " dark")}>
            <SearchIcon />
          </IconButton>
          <input
            placeholder="Search"
            className={"search-box" + (lightTheme ? "" : " dark")}
          />
        </div>

        <div className="ug-list">
          {users.map((user, index) => (
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className={"list-tem" + (lightTheme ? "" : " dark")}
              key={index}
              onClick={() => {
                console.log("Creating chat with", user.name);

                const config = {
                  headers: {
                    Authorization: `Bearer ${userData.token}`,
                  },
                };

                axios
                  .post(
                    "http://localhost:8080/chat/",
                    { userId: user._id },
                    config
                  )
                  .then(() => dispatch(refreshSidebarFun()))
                  .catch((err) => console.error("Failed to create chat:", err));
              }}
            >
              <p className={"con-icon" + (lightTheme ? "" : " dark")}>T</p>
              <p className={"con-title" + (lightTheme ? "" : " dark")}>
                {user.name}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default Users;

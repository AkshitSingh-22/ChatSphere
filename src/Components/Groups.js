import React, { useContext, useEffect, useState } from "react";
import "./myStyles.css";
import SearchIcon from "@mui/icons-material/Search";
import { IconButton } from "@mui/material";
import logo from "../Images/live-chat.png";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import RefreshIcon from "@mui/icons-material/Refresh";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { refreshSidebarFun } from "../Features/refreshSidebar";
import { myContext } from "./MainContainer";

function Groups() {
  const { refresh, setRefresh } = useContext(myContext);
  const lightTheme = useSelector((state) => state.themeKey);
  const dispatch = useDispatch();
  const [groups, setGroups] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();
  const userData = JSON.parse(localStorage.getItem("userData"));

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
      .get("http://localhost:8080/chat/fetchGroups", config)
      .then((response) => {
        setGroups(response.data);
      })
      .catch((error) => {
        console.error("Error fetching groups: ", error);
      });
  }, [refresh]);

  const handleJoinGroup = (groupId) => {
    if (!userData) {
      alert("Please Log In To Join a Group");
      return;
    }

    const config = {
      headers: {
        Authorization: `Bearer ${userData.token}`,
      },
    };
    axios
      .post(
        "http://localhost:8080/chat/joinGroup",
        { groupId },
        config
      )
      .then((response) => {
        setGroups((prevGroups) => {
          return prevGroups.map((group) => 
            group._id === response.data._id ? response.data : group
          );
        });
        alert("You have joined the group");
      })
      .catch((error) => {
        console.error("Error joining the group", error);
        alert("Failed to join the group");
      });
  };

  // ✅ Don't render until loading is complete
  if (!userData) return null;

  return (
    <>

    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0 }}
        transition={{ ease: "anticipate", duration: 0.3 }}
        className="list-container"
      >
        <div className={"ug-header" + (lightTheme ? "" : " dark")}>
          <img
            src={logo}
            style={{ height: "2rem", width: "2rem", marginLeft: "10px" }}
            alt="Chat Logo"
          />
          <p className={"ug-title" + (lightTheme ? "" : " dark")}>
            Available Groups
          </p>
          <IconButton
            className={"icon" + (lightTheme ? "" : " dark")}
            onClick={() => setRefresh((prev) => !prev)}
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
          {groups.length > 0 ? (
            groups.map((group, index) => (
              <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
                className={"list-tem" + (lightTheme ? "" : " dark")}
                key={index}
                onClick={() => {
                  handleJoinGroup(group._id);
                  dispatch(refreshSidebarFun());
                }}
              >
                <p className={"con-icon" + (lightTheme ? "" : " dark")}>T</p>
                <p className={"con-title" + (lightTheme ? "" : " dark")}>
                  {group.chatName}
                </p>
              </motion.div>
            ))
          ) : (
            <p
              style={{
                textAlign: "center",
                marginTop: "20px",
                color: lightTheme ? "#333" : "#ccc",
              }}
            >
              No groups available
            </p>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
    </>
  );
}

export default Groups;

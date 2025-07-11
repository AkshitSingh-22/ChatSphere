import React, { useEffect, useState } from 'react';
import "./myStyles.css";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import NightlightIcon from '@mui/icons-material/Nightlight';
import LightModeIcon from '@mui/icons-material/LightMode';
import SearchIcon from '@mui/icons-material/Search';
import LogoutIcon from '@mui/icons-material/Logout';
import AssistantIcon from '@mui/icons-material/Assistant';
import { IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../Features/themeSlice';
import axios from "axios";

const SideBar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const lightTheme = useSelector((state) => state.themeKey);
  const [conversations, setConversations] = useState([]);
  const [userData, setUserData] = useState(JSON.parse(localStorage.getItem("userData")));

  const logoutHandler = async () => {

    const token = userData?.token;
    const user = userData._id;

    try {
      const config = {
          headers: {
            Authorization: `Bearer ${userData.token}`,
          },
        };

        await axios.post(
          "http://localhost:8080/user/logout/",
          user,
          config
        );
        localStorage.removeItem("userData");
        navigate("/"); // Redirect to login or home page
    } catch(error) {
      console.log("LogOut Failed:",error);
      localStorage.removeItem("userData");
      navigate("/"); // Redirect to login or home page
    }
    
  };

  useEffect(() => {
    // Check if userData and token are available before attempting to fetch data
    if (!userData || !userData.token) {
      console.log("User Not Authenticated");
      navigate("/"); // Redirect to login if no userData or token
      return; // Do not run the rest of the effect if no userData or token
    }

    const fetchData = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userData.token}`,
          },
        };

        const response = await axios.get("http://localhost:8080/chat/", config);

        // Check if response and data are valid
        if (response && response.data) {
          setConversations(response.data);
        } else {
          console.error("No data received from API.");
          setConversations([]); // Prevent errors if no data is received
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setConversations([]); // Set empty array on error
      }
    };

    fetchData();
  }, [userData]); // Only run the effect when userData changes

  return (
    <div className='sidebar-container'>
      <div className={'sb-header' + (lightTheme ? "" : " dark")}>
        <div>
          <IconButton
            onClick={() => {
              navigate("/app/welcome");
            }}
          >
            <AccountCircleIcon className={'icon' + (lightTheme ? "" : " dark")} />
          </IconButton>
        </div>
        <div className='other-icons'>
          <IconButton onClick={() => { navigate("users") }}>
            <PersonAddIcon className={'icon' + (lightTheme ? "" : " dark")} />
          </IconButton>
          <IconButton onClick={() => { navigate("groups") }}>
            <GroupAddIcon className={'icon' + (lightTheme ? "" : " dark")} />
          </IconButton>
          <IconButton onClick={() => { navigate("create-groups") }}>
            <AddCircleIcon className={'icon' + (lightTheme ? "" : " dark")} />
          </IconButton>
          <IconButton onClick={() => { navigate("assistant-chat") }}>
            <AssistantIcon className={'icon' + (lightTheme ? "" : " dark")} />
          </IconButton>
          <IconButton onClick={() => { dispatch(toggleTheme()) }}>
            {lightTheme ? <NightlightIcon className={'icon' + (lightTheme ? "" : " dark")} /> : <LightModeIcon className={'icon' + (lightTheme ? "" : " dark")} />}
          </IconButton>
          <IconButton onClick={logoutHandler}>
            <LogoutIcon className={'icon' + (lightTheme ? "" : " dark")} />
          </IconButton>
        </div>
      </div>
      <div className={'sb-search' + (lightTheme ? "" : " dark")}>
        <IconButton className={'icon' + (lightTheme ? "" : " dark")}>
          <SearchIcon />
        </IconButton>
        <input placeholder='search' className={'search-box' + (lightTheme ? "" : " dark")} />
      </div>
      <div className={"sb-conversations" + (lightTheme ? "" : " dark")}>
        {conversations.length === 0 ? (
          <p>No conversations found.</p>
        ) : (
          conversations.map((conversation, index) => {
            var chatName = "";
            if (conversation.isGroupChat) {
              chatName = conversation.chatName;
            } else {
              conversation.users.map((user) => {
                if (user._id !== userData._id) {
                  chatName = user.name;
                }
              });
            }
            return (
              <div
                key={index}
                className='conversations-container'
                onClick={() => {
                  navigate("chat/" + conversation._id + "&" + chatName);
                }}
              >
                <p className={"con-icon" + (lightTheme ? "" : " dark")}>
                  {chatName[0]}
                </p>
                <p className={"con-title" + (lightTheme ? "" : " dark")}>
                  {chatName}
                </p>
                <p className={"con-lastMessage" + (lightTheme ? "" : " dark")}>
                  {conversation.latestMessage ? conversation.latestMessage.content : "No Previous Messages, Click Here to Start a new message."}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SideBar;

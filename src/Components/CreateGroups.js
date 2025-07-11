import React, { useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { refreshSidebarFun } from "../Features/refreshSidebar";
import DoneOutlineRoundedIcon from "@mui/icons-material/DoneOutlineRounded";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
} from "@mui/material";

function CreateGroups() {
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]); // Array of user objects
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const lightTheme = useSelector((state) => state.themeKey);

  const handleCreateGroup = () => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    if (!userData) return;

    const config = {
      headers: {
        Authorization: `Bearer ${userData.token}`,
        "Content-Type": "application/json",
      },
    };

    const payload = {
      name: groupName,
      users: JSON.stringify(selectedUsers.map(user => user._id)), // Array of userIds as string
    };

    axios
      .post("http://localhost:8080/chat/createGroup", payload, config)
      .then((response) => {
        console.log("Group created successfully:", response.data);
        dispatch(refreshSidebarFun());
      })
      .catch((err) => {
        console.error("Failed to create group:", err);
      });
  };

  return (
      <>
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            {"Do you want to create a Group Named " + groupName + "?"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              This will create a group in which you will be the admin, and others will be able to join this group.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Disagree</Button>
            <Button
              onClick={() => {
                handleCreateGroup();
                setOpen(false);
              }}
              autoFocus
            >
              Agree
            </Button>
          </DialogActions>
        </Dialog>
  
        <div className={"createGroups-container" + (lightTheme ? "" : " dark")}>
          <input
            placeholder="Enter Group Name"
            className={"search-box" + (lightTheme ? "" : " dark")}
            onChange={(e) => setGroupName(e.target.value)}
          />
          <IconButton
            className={"icon" + (lightTheme ? "" : " dark")}
            onClick={() => setOpen(true)}
          >
            <DoneOutlineRoundedIcon />
          </IconButton>
        </div>
      </>
    );
}

export default CreateGroups;

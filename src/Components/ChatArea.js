import React, { useContext, useEffect, useRef, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import SendIcon from "@mui/icons-material/Send";
import { IconButton, Skeleton } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import MessageSelf from "./MessageSelf";
import MessageOthers from "./MessageOthers";
import { myContext } from "./MainContainer";
import { socket } from "./socket";
import { refreshSidebarFun } from "../Features/refreshSidebar"; // ✅ Adjust the path as needed

function ChatArea() {
  const lightTheme = useSelector((state) => state.themeKey);
  const [messageContent, setMessageContent] = useState("");
  const [allMessages, setAllMessages] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const dispatch = useDispatch(); // ✅ Redux dispatch
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const { refresh, setRefresh } = useContext(myContext);

  const userDataRaw = localStorage.getItem("userData");
  const userData = userDataRaw ? JSON.parse(userDataRaw) : null;
  const self_id = userData?._id;
  const userToken = userData?.token;

  const { _id } = useParams();
  const [chat_id, chat_user] = _id?.split("&") || [];

  useEffect(() => {
    if (!userData) {
      navigate("/login");
    }
  }, [userData, navigate]);

  // Fetch messages when chat_id or refresh changes
  useEffect(() => {
    if (!userToken || !chat_id) return;

    const fetchMessages = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/message/${chat_id}`, {
          headers: { Authorization: `Bearer ${userToken}` },
        });

        if (!Array.isArray(response.data)) throw new Error("Invalid response format");

        setAllMessages(
          response.data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        );
        setLoaded(true);
      } catch (error) {
        console.error("Error fetching messages:", error);
        setLoaded(true);
      }
    };

    fetchMessages();
  }, [chat_id, refresh, userToken]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (allMessages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [allMessages]);

  // Setup socket
  useEffect(() => {
    if (!chat_id) return;

    socket.emit("joinChat", chat_id);

    socket.on("receiveMessage", (message) => {
      setAllMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off("receiveMessage");
      socket.emit("leaveChat", chat_id);
    };
  }, [chat_id]);

  // Send message
  const sendMessage = async () => {
    if (!messageContent.trim()) return;

    const newMessage = {
      content: messageContent,
      sender: { _id: self_id },
      chatId: chat_id,
      _id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    // Optimistic UI update
    setAllMessages((prevMessages) => [...prevMessages, newMessage]);

    try {
      await axios.post(
        "http://localhost:8080/message/",
        { content: messageContent, chatId: chat_id },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );

      socket.emit("sendMessage", newMessage);
      setMessageContent("");
      setRefresh((prev) => !prev);
      dispatch(refreshSidebarFun()); // ✅ Refresh sidebar
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  // Delete or exit chat
  const handleChatAction = async () => {
    const isGroup = chat_id?.startsWith("group_");
    const confirmMessage = isGroup
      ? "Do you want to leave the group?"
      : "All messages in this chat will be deleted. Are you sure?";

    if (!window.confirm(confirmMessage)) return;

    try {
      if (isGroup) {
        await axios.put(
          "http://localhost:8080/chat/groupExit",
          { chatId: chat_id },
          { headers: { Authorization: `Bearer ${userToken}` } }
        );
      } else {
        await axios.delete(`http://localhost:8080/chat/${chat_id}`, {
          headers: { Authorization: `Bearer ${userToken}` },
        });
      }

      navigate("/app/welcome");
      dispatch(refreshSidebarFun()); // ✅ Refresh sidebar
    } catch (error) {
      console.error("Error performing chat action:", error);
      alert("Failed to perform the action. Please try again.");
    }
  };

  if (!loaded) {
    return (
      <div style={{ padding: "10px", width: "100%", display: "flex", flexDirection: "column", gap: "10px" }}>
        <Skeleton variant="rectangular" sx={{ width: "100%", borderRadius: "10px" }} height={60} />
        <Skeleton variant="rectangular" sx={{ width: "100%", borderRadius: "10px", flexGrow: 1 }} />
        <Skeleton variant="rectangular" sx={{ width: "100%", borderRadius: "10px" }} height={60} />
      </div>
    );
  }

  return (
    <div className={`chatArea-container${lightTheme ? "" : " dark"}`}>
      {/* Header */}
      <div className={`chatArea-header${lightTheme ? "" : " dark"}`}>
        <p className={`con-icon${lightTheme ? "" : " dark"}`}>
          {chat_user?.charAt(0)?.toUpperCase() || "?"}
        </p>
        <div className={`header-text${lightTheme ? "" : " dark"}`}>
          <p className={`con-title${lightTheme ? "" : " dark"}`}>{chat_user || "Unknown User"}</p>
        </div>
        <IconButton className={`icon${lightTheme ? "" : " dark"}`} onClick={handleChatAction}>
          <DeleteIcon />
        </IconButton>
      </div>

      {/* Messages */}
      <div className={`messages-container${lightTheme ? "" : " dark"}`}>
        {allMessages.length === 0 && <p style={{ textAlign: "center", color: "#aaa" }}>No messages yet</p>}
        {allMessages.map((message) =>
          message.sender._id === self_id ? (
            <MessageSelf props={message} key={message._id} />
          ) : (
            <MessageOthers props={message} key={message._id} />
          )
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className={`text-input-area${lightTheme ? "" : " dark"}`}>
        <input
          type="text"
          placeholder="Type a Message"
          className={`search-box${lightTheme ? "" : " dark"}`}
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
        />
        <IconButton onClick={sendMessage} className={`icon${lightTheme ? "" : " dark"}`}>
          <SendIcon />
        </IconButton>
      </div>
    </div>
  );
}

export default ChatArea;

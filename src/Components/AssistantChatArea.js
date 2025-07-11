import React, { useContext, useEffect, useRef, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import SendIcon from "@mui/icons-material/Send";
import { IconButton } from "@mui/material";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import MessageSelf from "./MessageSelf";
import MessageOthers from "./MessageOthers";
import { myContext } from "./MainContainer";

function AssistantChatArea() {
  const lightTheme = useSelector((state) => state.themeKey);
  const [messageContent, setMessageContent] = useState("");
  const [allMessages, setAllMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const { refresh, setRefresh } = useContext(myContext);

  const userDataRaw = localStorage.getItem("userData");
  const userData = userDataRaw ? JSON.parse(userDataRaw) : null;
  const self_id = userData?._id;

  const { _id } = useParams();
  const [chat_id, chat_user] = _id?.split("&") || [];

  useEffect(() => {
    if (!userData) {
      navigate("/login");
    }
  }, [userData, navigate]);

  const handleSendMessage = async () => {
    if (!messageContent.trim()) return;

    try {
      const response = await axios.post("http://localhost:8080/api/gemini/ask", {
        prompt: messageContent,
      });

      const reply = response.data?.reply;
      if (reply) {
        console.log("Gemini replied:", reply);

        // ✅ Append user message & AI reply to `allMessages`
        setAllMessages((prevMessages) => [
          ...prevMessages,
          { sender: { _id: self_id }, content: messageContent },  // User message
          { sender: { _id: "gemini" }, content: reply },  // AI response
        ]);
      } else {
        console.error("No reply received from Gemini");
      }
    } catch (error) {
      console.error("Error talking to Gemini:", error.message || error);
    }

    setMessageContent("");  // ✅ Clear input after sending
  };

  return (
    <div className={`chatArea-container${lightTheme ? "" : " dark"}`}>
      {/* Header */}
      <div className={`chatArea-header${lightTheme ? "" : " dark"}`}>
        <p className={`con-icon${lightTheme ? "" : " dark"}`}>
          {"A"}
        </p>
        <div className={`header-text${lightTheme ? "" : " dark"}`}>
          <p className={`con-title${lightTheme ? "" : " dark"}`}>
            {"Your Assistant"}
          </p>
        </div>
        <IconButton className={`icon${lightTheme ? "" : " dark"}`}>
          <DeleteIcon />
        </IconButton>
      </div>

      {/* Messages */}
      <div className={`messages-container${lightTheme ? "" : " dark"}`}>
        {allMessages.length === 0 && <p style={{ textAlign: "center", color: "#aaa" }}>No messages yet</p>}
        {allMessages.map((message, index) =>
          message.sender._id === self_id ? (
            <MessageSelf key={index} props={message} />
          ) : (
            <MessageOthers key={index} props={message} />
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
            if (e.key === "Enter") handleSendMessage();  // ✅ Trigger send on Enter
          }}
        />
        <IconButton className={`icon${lightTheme ? "" : " dark"}`} onClick={handleSendMessage}>
          <SendIcon />
        </IconButton>
      </div>
    </div>
  );
}

export default AssistantChatArea;

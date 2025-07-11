import React from "react";
import "./myStyles.css";
import { useDispatch, useSelector } from "react-redux";

function MessageOthers({ props }) {
  const dispatch = useDispatch();
  const lightTheme = useSelector((state) => state.themeKey);

  if (!props || !props.sender) {
    console.error("MessageOthers received undefined props:", props);
    return null; // Prevent rendering issues
  }

  return (
    <div className={"other-message-container" + (lightTheme ? "" : " dark")}>
      <div className={"conversation-container" + (lightTheme ? "" : " dark")}>
        <p className={"con-icon" + (lightTheme ? "" : " dark")}>
          {props.sender?.name ? props.sender.name[0] : "?"}
        </p>
        <div className={"other-text-content" + (lightTheme ? "" : " dark")}>
          <p className={"con-title" + (lightTheme ? "" : " dark")}>
            {props.sender?.name || "Assistant"}
          </p>
          <p className={"con-lastMessage" + (lightTheme ? "" : " dark")}>
            {props.content || "Message not found"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default MessageOthers;

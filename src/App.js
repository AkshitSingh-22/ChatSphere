import React from "react";
import "./App.css";
import MainContainer from "./Components/MainContainer";
import Login from "./Components/Login";
import { Route, Routes } from "react-router-dom";
import Welcome from "./Components/Welcome";
import ChatArea from "./Components/ChatArea";
import Users from "./Components/Users";
import CreateGroups from "./Components/CreateGroups";
import Groups from "./Components/Groups";
import AssistantChatArea from "./Components/AssistantChatArea";
import { useSelector } from "react-redux";

function App() {
  const lightTheme = useSelector((state) => state.themeKey);

  return (
    <div className={"App" + (lightTheme ? "" : "-dark")}>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="app" element={<MainContainer />}>
          <Route path="welcome" element={<Welcome />} />
          <Route path="chat/:_id" element={<ChatArea />} />
          <Route path="users" element={<Users />} />
          <Route path="groups" element={<Groups />} />
          <Route path="create-groups" element={<CreateGroups />} />
          <Route path="assistant-chat" element={<AssistantChatArea />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;

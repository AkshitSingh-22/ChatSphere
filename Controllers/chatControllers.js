const expressAsyncHandler = require("express-async-handler");
const Chat = require("../modals/chatModel");
const User = require("../modals/userModel");
const Message = require("../modals/messageModel");

// Access a specific chat or create a new one if it doesn't exist
const accessChat = expressAsyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("UserId param not sent with request");
    return res.sendStatus(400); // Bad request if userId is not provided
  }

  try {
    let isChat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate("users", "-password")
      .populate("latestMessage");

    isChat = await User.populate(isChat, {
      path: "latestMessage.sender",
      select: "name email",
    });

    if (isChat.length > 0) {
      return res.send(isChat[0]); // Return the first chat if found
    } else {
      const chatData = {
        chatName: "sender", // Default name for the chat
        isGroupChat: false,
        users: [req.user._id, userId],
      };

      const createdChat = await Chat.create(chatData);
      const fullChat = await Chat.findOne({ _id: createdChat._id })
        .populate("users", "-password");

      return res.status(200).json(fullChat); // Return the created chat
    }
  } catch (error) {
    res.status(500);
    throw new Error(error.message); // Handle errors if any
  }
});

// Fetch all chats for the user
const fetchChats = expressAsyncHandler(async (req, res) => {
  try {
    const chats = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 }); // Sorting chats by the updatedAt field

    const populatedChats = await User.populate(chats, {
      path: "latestMessage.sender",
      select: "name email",
    });

    return res.status(200).json(populatedChats); // Return all chats for the user
  } catch (error) {
    res.status(500);
    throw new Error(error.message); // Handle errors if any
  }
});

// Fetch all groups
const fetchGroups = expressAsyncHandler(async (req, res) => {
  try {
    const allGroups = await Chat.find({ isGroupChat: true });
    return res.status(200).json(allGroups); // Return all groups
  } catch (error) {
    res.status(500);
    throw new Error(error.message); // Handle errors if any
  }
});

// Create a group chat
const createGroupChat = expressAsyncHandler(async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Data is insufficient" }); // Handle missing data
  }

  let users = JSON.parse(req.body.users); // Parse the users array from the request body
  users.push(req.user._id); // Add the creator (admin) of the group to the users list

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user._id,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    return res.status(200).json(fullGroupChat); // Return the newly created group chat
  } catch (error) {
    res.status(500);
    throw new Error(error.message); // Handle errors if any
  }
});

// Exit a group chat (user removes themselves from a group)
const groupExit = expressAsyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  try {
    // Check if the requester is the group admin before allowing exit
    const chat = await Chat.findById(chatId);

    if (chat.groupAdmin.toString() !== req.user._id.toString()) {
      return res.status(403).send({ message: "You are not authorized to perform this action" }); // Only admin can remove users
    }

    const removed = await Chat.findByIdAndUpdate(
      chatId,
      {
        $pull: { users: userId }, // Remove user from the chat
      },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!removed) {
      return res.status(404).send({ message: "Chat not found" }); // If chat not found
    }

    return res.json(removed); // Return the updated chat
  } catch (error) {
    res.status(500);
    throw new Error(error.message); // Handle errors if any
  }
});

// Join a group chat
const joinGroup = expressAsyncHandler(async (req, res) => {
  const { groupId } = req.body;
  const userId = req.user._id;  // Assuming you're extracting the user's ID from the token

  console.log('User ID:', userId);
  console.log('Group ID:', groupId);

  if (!groupId) {
    return res.status(400).send({ message: "Group ID is required" });
  }

  try {
    // Find the group chat and add the user to it
    const groupChat = await Chat.findById(groupId);

    if (!groupChat) {
      return res.status(404).send({ message: "Group not found" });
    }

    // Check if the user is already part of the group
    if (groupChat.users.includes(userId)) {
      return res.status(400).send({ message: "You are already a member of this group" });
    }

    // Add the user to the group
    groupChat.users.push(userId);
    await groupChat.save();

    const updatedGroupChat = await Chat.findById(groupId)
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(updatedGroupChat);
  } catch (error) {
    res.status(500);
    throw new Error(error.message); // Handle errors if any
  }
});

// Selectively delete a chat for one user only (removes the chat from the user's list but not the other person's)
const deleteChatForUser = expressAsyncHandler(async (req, res) => {
  const { chatId } = req.params;

  try {
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).send({ message: "Chat not found" });
    }

    // Check if the user is part of the chat
    if (!chat.users.includes(req.user._id)) {
      return res.status(403).send({ message: "You are not a participant in this chat" });
    }

    // Remove the user from the chat's users array (this "deletes" the chat for that user)
    chat.users = chat.users.filter(user => user.toString() !== req.user._id.toString());

    // Save the updated chat
    await chat.save();

    res.status(200).json({ message: "Chat removed from your chat list" });
  } catch (error) {
    res.status(500);
    throw new Error(error.message); // Handle errors if any
  }
});

module.exports = {
  accessChat,
  fetchChats,
  fetchGroups,
  createGroupChat,
  groupExit,
  joinGroup,
  deleteChatForUser,
};

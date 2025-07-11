const expressAsyncHandler = require("express-async-handler");
const Message = require("../modals/messageModel");
const User = require("../modals/userModel");
const Chat = require("../modals/chatModel");

// Get all messages for a specific chat
const allMessages = expressAsyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name email pic") // populate sender with name, email, and pic
      .populate("receiver", "name email pic") // correctly populate receiver
      .populate("chat");

    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// Send a message to a specific chat
const sendMessage = expressAsyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

  try {
    // Create a new message
    let message = await Message.create(newMessage);

    // Populate the sender, receiver, and chat fields
    message = await message.populate("sender", "name pic");
    message = await message.populate("receiver", "name pic");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name email",
    });

    // Update the latestMessage and updatedAt field in the Chat model
    await Chat.findByIdAndUpdate(
      chatId,
      {
        latestMessage: message._id,
        updatedAt: Date.now(), // Ensure that updatedAt is updated
      },
      { new: true }
    );

    // Return the new message
    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = { allMessages, sendMessage };

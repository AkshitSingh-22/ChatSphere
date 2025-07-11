const generateToken = require("../Config/generateToken");
const UserModel = require("../modals/userModel");
const expressAsyncHandler = require("express-async-handler");

// ✅ LOGIN CONTROLLER
const loginController = expressAsyncHandler(async (req, res) => {
  const { name, password } = req.body;

  const user = await UserModel.findOne({ name });
  if (user && (await user.matchPassword(password))) {
    // ✅ Mark user as online
    user.isOnline = true;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid Username or Password");
  }
});

// ✅ REGISTER CONTROLLER
const registerController = expressAsyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("All fields are required");
  }

  const userExist = await UserModel.findOne({ email });
  if (userExist) {
    throw new Error("User already exists with this email");
  }

  const userNameExist = await UserModel.findOne({ name });
  if (userNameExist) {
    throw new Error("Username is already taken");
  }

  const user = await UserModel.create({ name, email, password, isOnline: true });
  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Registration failed");
  }
});

// ✅ FETCH ONLINE USERS CONTROLLER
const fetchAllUsersController = expressAsyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
        isOnline: true,
      }
    : { isOnline: true }; // ✅ Only fetch users who are online

  const users = await UserModel.find(keyword).find({
    _id: { $ne: req.user._id }, // Exclude the current user
  });

  res.send(users);
});

// ✅ LOGOUT CONTROLLER (optional)
const logoutController = expressAsyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await UserModel.findById(userId);
  if (user) {
    user.isOnline = false;
    await user.save();
    res.status(200).json({ message: "Logged out successfully" });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

module.exports = {
  loginController,
  registerController,
  fetchAllUsersController,
  logoutController, // ✅ Optional
};

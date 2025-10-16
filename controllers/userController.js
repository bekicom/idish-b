const User = require("../models/userModel");
const Warehouse = require("../models/warehouseModel");
const Store = require("../models/Store");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
exports.registerUser = async (req, res) => {
  const { name, login, password, role, success } = req.body;

  try {
    const userExists = await User.findOne({ login });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ name, login, password, role, success });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        login: user.login,
        role: user.role,
        success: user.success,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.loginUser = async (req, res) => {
  const { login, password } = req.body;

  try {
    let user;
    let role;
    let success;
    user = await User.findOne({ login });
    console.log(user);

    role = user?.role;
    success = user?.success;
    if (!user) {
      user = await Warehouse.findOne({ login });
      role = "warehouse";
      success = { skaladorlar: true };
    }
    if (!user) {
      user = await Store.findOne({ login });
      role = "store";
      success = {
        qarzdorlar: true,
        xarajatlar: true,
        skaladorlar: true,
        dokon: true,
      };
    }

    if (!user) {
      return res.status(404).send();
    }
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(isMatch);

    if (!isMatch) {
      return res.status(401);
    }
    return res.status(200).json({
      _id: user._id,
      name: user.name,
      login: user.login,
      role: role,
      success: success,
      token: generateToken(user._id, role),
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: "Server error" });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, login, password, role, success } = req.body;

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name || user.name;
    user.login = login || user.login;
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }
    user.role = role || user.role;
    user.success = success || user.success;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      login: updatedUser.login,
      role: updatedUser.role,
      success: updatedUser.success,
      token: generateToken(updatedUser._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.remove();

    res.json({ message: "User removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET);
};

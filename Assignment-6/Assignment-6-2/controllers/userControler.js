const User = require("../model/User");

// Route 1: Create User
exports.addUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.create({ name, email, password });
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

// Route 2: Add Profile
exports.addProfile = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { profileName, url } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.profiles.push({ profileName, url });
    await user.save();

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

// Route 3: Get Users (filter by profile if query exists)
exports.getUsers = async (req, res, next) => {
  try {
    const { profile } = req.query;
    let query = {};

    if (profile) {
      query = { "profiles.profileName": profile };
    }

    const users = await User.find(query);
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

// Route 4: Search User and Profile
exports.searchUser = async (req, res, next) => {
  try {
    const { name, profile } = req.query;

    const user = await User.findOne({ name });
    if (!user) return res.status(404).json({ message: "User not found" });

    const foundProfile = user.profiles.find((p) => p.profileName === profile);

    if (foundProfile) {
      return res.status(200).json(foundProfile);
    } else {
      return res.status(200).json({
        message: "User found, but profile not found",
        user,
      });
    }
  } catch (error) {
    next(error);
  }
};

// Route 5: Update Profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { userId, profileName } = req.params;
    const { url } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const profile = user.profiles.find((p) => p.profileName === profileName);
    if (!profile)
      return res.status(404).json({ message: "Profile not found" });

    profile.url = url;
    await user.save();

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

// Route 6: Delete Profile
exports.deleteProfile = async (req, res, next) => {
  try {
    const { userId, profileName } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.profiles = user.profiles.filter((p) => p.profileName !== profileName);
    await user.save();

    res.status(200).json({ message: "Profile deleted", user });
  } catch (error) {
    next(error);
  }
};

import User from '../models/User.js';
export const getUserData = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      message:"UserData fetched Succefully",
      userData: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAccountVerified: user.isAccountVerified
      }
    })
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
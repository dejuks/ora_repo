// controllers/userController.js
import { getUserById, updateUser, deleteUser } from "../models/User.js";
import { 
  getProfileByUserId, 
  updateWikiProfile, 
  getTopContributors,
  incrementArticleCount,
  incrementEditCount,
  incrementUploadCount
} from "../models/WikiProfile.js";

// 🔹 Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id || req.user.id;
    
    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get profile' 
    });
  }
};

// 🔹 Update user profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullName, bio, language, displayName, website, location } = req.body;

    // Update user table
    const updatedUser = await updateUser(userId, { fullName, bio, language });

    // Update wiki profile
    const updatedProfile = await updateWikiProfile(userId, { 
      displayName, 
      bio, 
      website, 
      location 
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser,
        profile: updatedProfile
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update profile' 
    });
  }
};

// 🔹 Upload avatar
export const uploadAvatar = async (req, res) => {
  try {
    const userId = req.user.id;
    const { avatarUrl } = req.body;

    if (!avatarUrl) {
      return res.status(400).json({ 
        success: false, 
        message: 'Avatar URL is required' 
      });
    }

    const updatedProfile = await updateWikiProfile(userId, { avatarUrl });

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: { avatarUrl: updatedProfile.avatar_url }
    });

  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to upload avatar' 
    });
  }
};

// 🔹 Get top contributors
export const getTopContributorsList = async (req, res) => {
  try {
    const limit = req.query.limit || 10;
    const contributors = await getTopContributors(limit);

    res.json({
      success: true,
      data: { contributors }
    });

  } catch (error) {
    console.error('Get contributors error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get contributors' 
    });
  }
};

// 🔹 Delete account
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { password } = req.body;

    // Here you would verify password before deletion
    // const user = await getUserById(userId);
    // const isValid = await verifyPassword(password, user.password_hash);
    
    // if (!isValid) {
    //   return res.status(401).json({ success: false, message: 'Invalid password' });
    // }

    await deleteUser(userId);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete account' 
    });
  }
};

// 🔹 Increment article count (called when user creates article)
export const addArticleContribution = async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await incrementArticleCount(userId);

    res.json({
      success: true,
      message: 'Contribution recorded',
      data: profile
    });

  } catch (error) {
    console.error('Add contribution error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to record contribution' 
    });
  }
};

// 🔹 Increment edit count (called when user edits article)
export const addEditContribution = async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await incrementEditCount(userId);

    res.json({
      success: true,
      message: 'Edit recorded',
      data: profile
    });

  } catch (error) {
    console.error('Add edit error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to record edit' 
    });
  }
};
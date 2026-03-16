// controllers/wikiAuthController.js
import { 
  createWikiAuthor, 
  getUserByEmail, 
  getUserByUsername, 
  verifyPassword,
  getWikiAuthorById,
  updateLastLogin
} from "../models/createWikiUser.js";
import jwt from "jsonwebtoken";

// Generate JWT Token - MAKE SURE UUID IS INCLUDED
const generateToken = (user) => {
  // IMPORTANT: Include uuid in the token
  return jwt.sign(
    {
      uuid: user.uuid,           // This must be here
      id: user.uuid,             // Include as id for compatibility
      email: user.email,
      name: user.full_name || user.username,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '1d' }
  );
};

// 🔹 Register Wiki Author
export const registerWikiAuthor = async (req, res) => {
  try {
    const { username, email, password, full_name, bio, language } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username, email and password'
      });
    }

    const existingUsername = await getUserByUsername(username);
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: 'Username already taken'
      });
    }

    const existingEmail = await getUserByEmail(email);
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    const newAuthor = await createWikiAuthor({
      username,
      email,
      password,
      full_name,
      bio,
      language
    });

    // Generate token with UUID
    const token = generateToken(newAuthor);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          uuid: newAuthor.uuid,
          username: newAuthor.username,
          email: newAuthor.email,
          full_name: newAuthor.full_name
        },
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Registration failed'
    });
  }
};

// 🔹 Login Wiki Author - FIX THIS FUNCTION
export const loginWikiAuthor = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Get user from database
    const user = await getUserByEmail(email);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated'
      });
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    await updateLastLogin(user.uuid);

    // Get complete user data
    const completeUser = await getWikiAuthorById(user.uuid);
    
    // CRITICAL: Generate token with UUID
    const token = jwt.sign(
      { 
        uuid: user.uuid,           // This MUST be included
        id: user.uuid,             // For compatibility
        email: user.email,
        name: user.full_name || user.username
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    console.log("✅ Login successful for:", user.email);
    console.log("✅ Token generated with UUID:", user.uuid);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          uuid: user.uuid,
          username: user.username,
          email: user.email,
          full_name: user.full_name
        },
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
};

// 🔹 Get current wiki author
export const getCurrentWikiAuthor = async (req, res) => {
  try {
    const user = await getWikiAuthorById(req.user.uuid);
    
    res.json({
      success: true,
      data: {
        user: {
          uuid: user.uuid,
          username: user.username,
          email: user.email,
          full_name: user.full_name,
          profile: user
        }
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user data'
    });
  }
};

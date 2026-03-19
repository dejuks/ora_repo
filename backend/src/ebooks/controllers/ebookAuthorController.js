// controllers/ebookAuthorController.js
import EbookAuthor from "../models/EbookAuthor.js";
import jwt from "jsonwebtoken";

// Register new author
export const register = async (req, res) => {
  try {
    const { username, email, password, full_name, biography, affiliation } = req.body;

    // Validate required fields
    if (!username || !email || !password || !full_name) {
      return res.status(400).json({
        success: false,
        message: "Username, email, password, and full name are required"
      });
    }

    // Check if user already exists
    const existingUser = await EbookAuthor.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists"
      });
    }

    const existingUsername = await EbookAuthor.findByUsername(username);
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: "Username already taken"
      });
    }

    // Register new author
    const result = await EbookAuthor.register({
      username,
      email,
      password,
      full_name,
      biography,
      affiliation
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        id: result.user.id,
        username: result.user.username,
        role: result.user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      message: "Ebook author registered successfully",
      data: {
        token,
        user: {
          id: result.user.id,
          username: result.user.username,
          email: result.user.email,
          full_name: result.user.full_name,
          role: result.user.role,
          author_id: result.author.id,
          biography: result.author.biography,
          affiliation: result.author.affiliation,
          created_at: result.author.created_at
        }
      }
    });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Error registering ebook author"
    });
  }
};

// Login author
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    // Find author by email
    const author = await EbookAuthor.findByEmail(email);
    
    if (!author) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Verify password
    const validPassword = await EbookAuthor.verifyPassword(password, author.password);
    
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Generate token
    const token = jwt.sign(
      {
        id: author.id,
        username: author.username,
        role: author.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Remove password from response
    delete author.password;

    res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: author
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Error logging in"
    });
  }
};

// Get current author
export const getCurrentAuthor = async (req, res) => {
  try {
    const author = await EbookAuthor.findById(req.user.id);
    
    if (!author) {
      return res.status(404).json({
        success: false,
        message: "Author not found"
      });
    }

    // Remove password from response
    delete author.password;

    res.json({
      success: true,
      data: author
    });

  } catch (error) {
    console.error("Get current author error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching author data"
    });
  }
};

// Get all authors
export const getAllAuthors = async (req, res) => {
  try {
    const authors = await EbookAuthor.getAll();
    
    res.json({
      success: true,
      data: authors
    });

  } catch (error) {
    console.error("Get all authors error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching authors"
    });
  }
};

// Get author by ID
export const getAuthorById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if id is user_id or author_id
    const author = await EbookAuthor.findById(id) || await EbookAuthor.findByAuthorId(id);
    
    if (!author) {
      return res.status(404).json({
        success: false,
        message: "Author not found"
      });
    }

    // Remove password from response
    delete author.password;

    res.json({
      success: true,
      data: author
    });

  } catch (error) {
    console.error("Get author by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching author"
    });
  }
};

// Update author
export const updateAuthor = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, email, biography, affiliation } = req.body;

    // Check if author exists
    const existingAuthor = await EbookAuthor.findById(id);
    
    if (!existingAuthor) {
      return res.status(404).json({
        success: false,
        message: "Author not found"
      });
    }

    // Check if user is updating their own profile
    if (req.user.id !== existingAuthor.id) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own profile"
      });
    }

    // Update author
    const updatedAuthor = await EbookAuthor.update(id, {
      full_name,
      email,
      biography,
      affiliation
    });

    // Remove password from response
    delete updatedAuthor.password;

    res.json({
      success: true,
      message: "Author profile updated successfully",
      data: updatedAuthor
    });

  } catch (error) {
    console.error("Update author error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating author"
    });
  }
};

// Delete author
export const deleteAuthor = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if author exists
    const existingAuthor = await EbookAuthor.findById(id);
    
    if (!existingAuthor) {
      return res.status(404).json({
        success: false,
        message: "Author not found"
      });
    }

    // Check if user is deleting their own profile
    if (req.user.id !== existingAuthor.id) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own profile"
      });
    }

    // Delete author (cascade will handle both tables)
    await EbookAuthor.delete(id);

    res.json({
      success: true,
      message: "Author deleted successfully"
    });

  } catch (error) {
    console.error("Delete author error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting author"
    });
  }
};
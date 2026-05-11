import * as DashboardModel from "../models/dashboard.model.js";

export async function getCurrentUserDashboard(req, res) {
  try {
    const userId = req.user.id;

    const user = await DashboardModel.getCurrentUser(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const roleNames =
      user.roles?.map((r) => r.role_name?.toUpperCase()) || [];

    let dashboard = "author";

    if (roleNames.includes("EBOOK_ADMIN")) {
      dashboard = "admin";
    } else if (roleNames.includes("EBOOK_EDITOR")) {
      dashboard = "editor";
    } else if (roleNames.includes("EBOOK_REVIEWER")) {
      dashboard = "reviewer";
    } else if (roleNames.includes("EBOOK_AUTHOR")) {
      dashboard = "author";
    }

    return res.json({
      success: true,
      message: "Dashboard loaded successfully",
      data: {
        user,
        dashboard,
      },
    });
  } catch (error) {
    console.error("Dashboard Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard",
    });
  }
}
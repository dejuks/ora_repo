import { login } from "../services/auth.service.js";

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const data = await login(email, password);
    res.json(data);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};
export const me = async (req, res) => {
  res.json({
    uuid: req.user.uuid,
    email: req.user.email,
  });
};

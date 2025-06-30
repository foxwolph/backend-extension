
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadDB } from '../utils.js';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function checkAuth(req, res, next) {
  if (req.cookies.token === "valid_admin") return next();
  res.redirect("/login");
}

router.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../dashboard/login.html"));
});

router.post("/login", express.urlencoded({ extended: true }), (req, res) => {
  const db = loadDB();
  const { username, password } = req.body;
  if (
    username === db.admin.username &&
    password === db.admin.password
  ) {
    res.cookie("token", "valid_admin");
    return res.redirect("/");
  }
  res.send("Invalid credentials");
});

router.use("/", checkAuth, express.static(path.join(__dirname, "../dashboard")));

export default router;

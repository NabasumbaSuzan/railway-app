require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Root route (VERY IMPORTANT)
app.get("/", (req, res) => {
  res.send("Task API is running 🚀");
});

// ✅ Health check route (for Railway)
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

/* CREATE task */
app.post("/tasks", async (req, res) => {
  try {
    const { title } = req.body;
    const result = await pool.query(
      "INSERT INTO tasks (title) VALUES ($1) RETURNING *",
      [title]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});

/* READ tasks */
app.get("/tasks", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM tasks ORDER BY id DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
  }
});

/* DELETE task */
app.delete("/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM tasks WHERE id = $1", [id]);
    res.json("Task deleted");
  } catch (err) {
    console.error(err.message);
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
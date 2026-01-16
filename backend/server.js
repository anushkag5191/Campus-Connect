const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { sql, poolPromise } = require("./db");

const app = express();

/* =========================
   MIDDLEWARE
========================= */
app.use(cors());
app.use(bodyParser.json());

/* =========================
   TEST ROUTE
========================= */
app.get("/", (req, res) => {
  res.send("Backend is running successfully 🚀");
});

/* =========================
   GET ALL USERS (CONNECT PAGE)
========================= */
app.get("/users", async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT
        u.user_id,
        u.first_name,
        u.last_name,
        u.admission_year,
        ISNULL(u.exam_prep, 'N/A') AS exam_prep,
        p.programme_name,
        b.branch_name
      FROM Users u
      LEFT JOIN Programme p ON u.programme_id = p.programme_id
      LEFT JOIN Branch b ON u.branch_id = b.branch_id
    `);

    console.log("Users fetched from DB:", result.recordset);
    res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   GET SINGLE USER (PROFILE PAGE)
========================= */
app.get("/users/:id", async (req, res) => {
  try {
    const pool = await poolPromise;
    const userId = req.params.id;

    const userResult = await pool.request()
      .input("id", sql.Int, userId)
      .query(`
        SELECT
          u.user_id,
          u.first_name,
          u.last_name,
          u.bio,
          u.admission_year,
          ISNULL(u.exam_prep, 'N/A') AS exam_prep,
          p.programme_name,
          b.branch_name
        FROM Users u
        LEFT JOIN Programme p ON u.programme_id = p.programme_id
        LEFT JOIN Branch b ON u.branch_id = b.branch_id
        WHERE u.user_id = @id
      `);

    if (!userResult.recordset.length) {
      return res.status(404).json({ error: "User not found" });
    }

    const internshipResult = await pool.request()
      .input("id", sql.Int, userId)
      .query(`
        SELECT company_name, role, duration
        FROM Internship
        WHERE user_id = @id
      `);

    const projectResult = await pool.request()
      .input("id", sql.Int, userId)
      .query(`
        SELECT project_name, description, technology_used, github_link
        FROM Project
        WHERE user_id = @id
      `);

    res.json({
      ...userResult.recordset[0],
      internships: internshipResult.recordset,
      projects: projectResult.recordset
    });

  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   START SERVER
========================= */
app.listen(3000, () => {
  console.log("🚀 Server running on port 3000");
});

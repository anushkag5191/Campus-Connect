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
   GET ALL USERS
========================= */
app.get("/users", async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT 
        user_id,
        first_name,
        last_name,
        email_id,
        phone_number,
        gender,
        admission_year
      FROM Users
    `);

    res.json(result.recordset);
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   GET SINGLE USER
========================= */
app.get("/users/:id", async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input("id", sql.Int, req.params.id)
      .query(`
        SELECT 
          user_id,
          first_name,
          last_name,
          email_id,
          bio,
          phone_number,
          alternate_phone,
          dob,
          gender,
          admission_year
        FROM Users
        WHERE user_id = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error("❌ Error fetching user:", err);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   ADD NEW USER
========================= */
app.post("/users", async (req, res) => {
  const {
    first_name,
    last_name,
    email_id,
    phone_number,
    gender,
    admission_year
  } = req.body;

  if (!first_name || !last_name || !email_id || !admission_year) {
    return res.status(400).json({ error: "Required fields missing" });
  }

  try {
    const pool = await poolPromise;

    await pool.request()
      .input("first_name", sql.VarChar(100), first_name)
      .input("last_name", sql.VarChar(100), last_name)
      .input("email_id", sql.VarChar(150), email_id)
      .input("phone_number", sql.VarChar(20), phone_number || "")
      .input("gender", sql.VarChar(20), gender || "")
      .input("admission_year", sql.Int, admission_year)
      .query(`
        INSERT INTO Users
        (first_name, last_name, email_id, phone_number, gender, admission_year)
        VALUES
        (@first_name, @last_name, @email_id, @phone_number, @gender, @admission_year)
      `);

    res.status(201).json({ message: "User added successfully" });
  } catch (err) {
    console.error("❌ Error adding user:", err);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   UPDATE USER (FIXED)
========================= */
app.put("/users/:id", async (req, res) => {
  const {
    first_name,
    last_name,
    email_id,
    phone_number,
    alternate_phone,
    bio,
    dob,
    gender
  } = req.body;

  try {
    const pool = await poolPromise;

    const exists = await pool.request()
      .input("id", sql.Int, req.params.id)
      .query(`SELECT user_id FROM Users WHERE user_id = @id`);

    if (exists.recordset.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    await pool.request()
      .input("id", sql.Int, req.params.id)
      .input("first_name", sql.VarChar(100), first_name || "")
      .input("last_name", sql.VarChar(100), last_name || "")
      .input("email_id", sql.VarChar(150), email_id || "")
      .input("phone_number", sql.VarChar(20), phone_number || "")
      .input("alternate_phone", sql.VarChar(20), alternate_phone || "")
      .input("bio", sql.VarChar(500), bio || "")
      .input("dob", sql.Date, dob ? new Date(dob) : null)
      .input("gender", sql.VarChar(20), gender || "")
      .query(`
        UPDATE Users SET
          first_name = @first_name,
          last_name = @last_name,
          email_id = @email_id,
          phone_number = @phone_number,
          alternate_phone = @alternate_phone,
          bio = @bio,
          dob = @dob,
          gender = @gender
        WHERE user_id = @id
      `);

    res.json({ success: true, message: "Profile saved successfully!" });

  } catch (err) {
    console.error("❌ SQL ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   DELETE USER
========================= */
app.delete("/users/:id", async (req, res) => {
  try {
    const pool = await poolPromise;

    await pool.request()
      .input("id", sql.Int, req.params.id)
      .query(`DELETE FROM Users WHERE user_id = @id`);

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting user:", err);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   START SERVER
========================= */
app.listen(3000, () => {
  console.log("🚀 Server running on port 3000");
});

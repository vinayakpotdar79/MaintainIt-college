import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import pg from "pg";
import passport from "passport";
import session from "express-session";
import { Strategy } from "passport-local";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT;
 const saltRounds = 10;

// Session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 *60}, // 1 hour
  })
);

// PostgreSQL setup
const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

db.connect();

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());

// ✅ Passport Strategy (only username and password checked here)
passport.use(
  new Strategy(async function verify(username, password, cb) {
    try {
      const result = await db.query("SELECT * FROM users WHERE username = $1", [username]);

      if (result.rows.length === 0) {
        return cb(null, false, { message: "Invalid username" }); // ✅ username not found
      }

      const user = result.rows[0];
      // const hash = await bcrypt.hash(password, saltRounds);
      // console.log(hash)
      const valid = await bcrypt.compare(password, user.password);

      if (!valid) {
        return cb(null, false, { message: "Invalid password" }); // ✅ password incorrect
      }

      return cb(null, user); // ✅ authenticated
    } catch (err) {
      return cb(err);
    }
  })
);

// Serialize/Deserialize
passport.serializeUser((user, cb) => cb(null, user));
passport.deserializeUser((user, cb) => cb(null, user));

// Login Route
app.post("/login", (req, res, next) => {
  const roleFromClient = req.body.role;

  passport.authenticate("local", (err, user, info) => {
    console.log(info)
    if (err) return next(err);

    if (!user) {
      return res.status(401).json({ message: info?info.message: "Invalid credentials" });
    }

    // Role check manually
    if (user.role !== roleFromClient) {
      return res.status(403).json({ message: "Role mismatch" });
    }

    req.login(user, (err) => {
      if (err) return next(err);
      return res.json({ message: "Login successful", user });
    });
  })(req, res, next);
});

//Is authenticated middlware
 function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ message: "Unauthorized" });
}

app.get("/reporter", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ message: "Welcome to the reporter route!" });
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
});

app.post("/report-issue",async(req,res)=>{
  let user_id=req.user.id;
  console.log(req.user)
  const {floor,room,device,description,priority,createdAt}=req.body;
  try{
let result=await db.query("INSERT INTO issues(user_id,floor,room,device,description,priority,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7)",
  [user_id,floor,room,device,description,priority,createdAt]);
res.status(200).json({ 
    success: true,
    message: "Issue reported successfully",
  });}
  catch(err){
    console.error(err);
    res.status(500).json({Message:"error submitting report"})
  }
})

app.get("/myissues",async(req,res)=>{
  let user_id=req.user.id
 try{
  let result= await
 db.query("SELECT  floor, room, device, description, priority, status, created_at FROM issues WHERE user_id = $1 ORDER BY created_at DESC",[user_id])
  console.log(result.rows)
  res.status(200).json({ 
    success: true,
  issues: result.rows,
  });
}
 catch(err){
      res.status(500).json({Message:"error submitting report"})
 }

})

app.get("/dashboard",async(req,res)=>{
  let user_id=req.user.id
  let user_role=req.user.role
 try{
  let result= await db.query("SELECT id,floor, room, device, description, priority, status, created_at FROM issues WHERE user_id = $1 ORDER BY created_at DESC"
    ,[user_id])
  console.log(result.rows)
  res.status(200).json({ 
    success: true,
  issues: result.rows,
  });
}
 catch(err){
      res.status(500).json({Message:"error submitting report"})
 }

})

app.get("/maintainer", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ message: "Welcome to the maintainer route!"});
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
});

// Get all issues assigned to the logged-in maintainer
app.get("/issues", async (req, res) => {
  const maintainerId = req.user.id;

  try {
    const result = await db.query(
      `SELECT id, floor, room, device, description, priority, status, created_at
       FROM issues
       ORDER BY created_at DESC`,

    );
    console.log(result.rows)
    res.status(200).json({ success: true, issues: result.rows });
  } catch (err) {
    console.error("Error fetching issues:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get all issues assigned to the currently logged-in maintainer
app.get("/assigned-issues", async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, floor, room, device, description, priority, status, created_at 
       FROM issues 
       ORDER BY created_at DESC`);
    res.status(200).json({ issues: result.rows });
  } catch (err) {
    console.error("Error fetching assigned issues:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PATCH /issues/:id
app.patch("/issues/:id", async (req, res) => {
  const issueId = req.params.id;
  const { status, remark } = req.body;
  const maintainerId = req.user.id;

   try {
    await db.query(
      `UPDATE issues 
       SET status = $1, remark = $2 
       WHERE id = $3`,
      [status, remark, issueId]
    );

    res.status(200).json({ success: true, message: "Issue updated successfully" });
  } catch (err) {
    console.error("Error updating issue:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});


// Route to fetch user profile
app.get("/profile",isAuthenticated ,async (req, res) => {
  const userId = req.user.id
  try {
    const result = await db.query(
      "SELECT username, email, phone, role, joined_at FROM users WHERE id = $1",
      [userId]
    );
    const user = result.rows[0];
    res.status(200).json(user);
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ message: "Server error" });
  }
});
app.post("/logout",(req,res)=>{
 req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.session.destroy(() => {
      res.clearCookie("connect.sid"); // Optional: clear cookie
      res.status(200).json({ message: "Logged out successfully" });
    });
  });});

app.listen(PORT,() => {
  console.log(`Server running on http://localhost:${PORT}`);
});

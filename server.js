"use strict";

const express = require("express");
const path    = require("path");
require("dotenv").config();

const { generateAndStorePDF } = require("./src/pdf");

const app = express();

// Validate required env vars
const requiredEnv = ["SUPABASE_URL", "SUPABASE_SERVICE_KEY"];
const missingEnv = requiredEnv.filter(key => !process.env[key]);
if (missingEnv.length > 0) {
  console.error("❌ Missing required environment variables:", missingEnv.join(", "));
  console.error("   Please set them in Render Dashboard > Environment Variables");
}

// Serve static files from public folder
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json({ limit: "10mb" }));

// Health check
app.get("/health", (_req, res) => res.json({ status: "ok", env: { supabase: !!process.env.SUPABASE_URL } }));

// Privacy policy
app.get("/privacy", (_req, res) =>
  res.sendFile(path.join(__dirname, "public", "privacy.html"))
);

// Web wizard submit
app.post("/submit", async (req, res) => {
  const { data, lang } = req.body;
  
  if (!data) {
    return res.status(400).json({ ok: false, error: "No data provided" });
  }

  // Check if Supabase is configured
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    console.error("❌ Supabase not configured. Set SUPABASE_URL and SUPABASE_SERVICE_KEY");
    return res.status(500).json({ 
      ok: false, 
      error: "Server configuration error. Please contact support." 
    });
  }

  try {
    const submissionId = "web-" + Date.now();
    const pdfUrl = await generateAndStorePDF(data, submissionId);
    console.log(`✅ Submission: ${data.name || "Anonymous"} → ${data.agency || "No agency"}`);
    res.json({ ok: true, pdfUrl });
  } catch (err) {
    console.error("❌ Submit error:", err.message);
    let errorMsg = err.message;
    if (err.message.includes("relation") && err.message.includes("does not exist")) {
      errorMsg = "Database table not set up. Please contact administrator.";
    } else if (err.message.includes("bucket") && err.message.includes("does not exist")) {
      errorMsg = "Storage not configured. Please contact administrator.";
    }
    res.status(500).json({ ok: false, error: errorMsg });
  }
});

// Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 StartJobReady listening on port ${PORT}`));

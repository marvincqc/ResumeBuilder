"use strict";

const fs = require("fs");
const fsp = fs.promises;
const express = require("express");
const path    = require("path");
const os = require("os");
const { Readable } = require("stream");
const { pipeline } = require("stream/promises");
require("dotenv").config();

const { generateAndStorePDF } = require("./src/pdf");
const packageInfo = require("./package.json");

const app = express();
const rootDir = __dirname;
const resumeOutputDir = path.join(rootDir, "resume_output");
const appName = "JobReady";

app.use("/resume_output", express.static(resumeOutputDir));
app.use(express.static(path.join(rootDir, "public")));
app.use(express.json({ limit: "50mb" }));

function getDeploymentMeta() {
  const commit = String(process.env.RENDER_GIT_COMMIT || process.env.GIT_COMMIT || "").trim();
  const branch = String(process.env.RENDER_GIT_BRANCH || process.env.GIT_BRANCH || "").trim();

  return {
    app: appName,
    version: packageInfo.version,
    commit: commit || null,
    branch: branch || null,
  };
}

function sanitizeTempSegment(value, fallback = "attachment") {
  const cleaned = String(value ?? "")
    .trim()
    .replace(/[\/\\?%*:|"<>]/g, "_")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();

  return cleaned || fallback;
}

function cleanupTempDir(dir) {
  if (!dir) return Promise.resolve();
  return fsp.rm(dir, { recursive: true, force: true }).catch(() => {});
}

async function writeUploadedFile(file, tempPath) {
  const source = typeof file?.stream === "function" ? Readable.fromWeb(file.stream()) : null;
  if (!source) {
    throw new Error("Unsupported uploaded file payload.");
  }

  await pipeline(source, fs.createWriteStream(tempPath));
}

async function readMultipartSubmission(req) {
  const tempDir = await fsp.mkdtemp(path.join(os.tmpdir(), "jobready-upload-"));
  try {
    const request = new Request(new URL(req.originalUrl || req.url, "http://127.0.0.1").toString(), {
      method: req.method,
      headers: req.headers,
      body: req,
      duplex: "half",
    });

    const formData = await request.formData();
    const payloadRaw = formData.get("payload");
    if (typeof payloadRaw !== "string" || !payloadRaw.trim()) {
      const err = new Error("Missing submission payload.");
      err.statusCode = 400;
      throw err;
    }

    let payload;
    try {
      payload = JSON.parse(payloadRaw);
    } catch {
      const err = new Error("Invalid submission payload.");
      err.statusCode = 400;
      throw err;
    }

    const attachmentFiles = formData.getAll("attachments");
    const attachments = [];
    for (const file of attachmentFiles) {
      if (!file || typeof file.stream !== "function") continue;

      const baseName = path.basename(file.name || "attachment", path.extname(file.name || ""));
      const safeStem = sanitizeTempSegment(baseName, "attachment");
      const ext = path.extname(file.name || "").toLowerCase();
      const tempPath = path.join(
        tempDir,
        `${String(attachments.length + 1).padStart(2, "0")}_${safeStem}${ext || ""}`
      );

      await writeUploadedFile(file, tempPath);
      attachments.push({
        name: file.name || "attachment",
        type: file.type || "application/octet-stream",
        size: file.size || 0,
        tempPath,
      });
    }

    return {
      data: payload.data,
      lang: payload.lang,
      attachments,
      cleanupDir: tempDir,
    };
  } catch (err) {
    await cleanupTempDir(tempDir);
    throw err;
  }
}

async function readSubmissionInput(req) {
  const contentType = String(req.headers["content-type"] || "");
  if (contentType.includes("multipart/form-data")) {
    return readMultipartSubmission(req);
  }

  const body = req.body ?? {};
  return {
    data: body.data,
    lang: body.lang,
    attachments: Array.isArray(body.attachments) ? body.attachments : [],
    cleanupDir: null,
  };
}

// ─── Health check (used by cron keepalive) ────────────────────────────────────
app.get("/health", (_req, res) => res.json({ status: "ok", ...getDeploymentMeta() }));

// ─── Main app + privacy page ─────────────────────────────────────────────────
app.get("/", (_req, res) => res.sendFile(path.join(rootDir, "public", "index.html")));

// ─── Privacy policy ───────────────────────────────────────────────────────────
app.get("/privacy", (_req, res) => res.sendFile(path.join(rootDir, "public", "privacy.html")));

// Passport OCR was moved to the browser. Keep this route non-fatal for stale clients.
app.all("/ocr-passport", (_req, res) => {
  res.status(410).json({
    ok: false,
    error: "Passport OCR now runs in the browser on the latest JobReady build. Redeploy main if this endpoint is still being called.",
  });
});

// ─── Web wizard submit ────────────────────────────────────────────────────────
app.post("/submit", async (req, res) => {
  let cleanupDir = null;
  try {
    const submission = await readSubmissionInput(req);
    const { data, attachments } = submission;
    cleanupDir = submission.cleanupDir;
    if (!data || typeof data !== "object") {
      return res.status(400).json({ ok: false, error: "No data provided" });
    }

    const submissionId = "web-" + Date.now();
    const safeAttachments = Array.isArray(attachments) ? attachments : [];
    const result = await generateAndStorePDF(data, submissionId, safeAttachments);
    console.log(`✅ Submission: ${data.name} → ${data.agency} (${safeAttachments.length} attachment(s))`);
    res.json({ ok: true, ...result });
  } catch (err) {
    console.error("Submit error:", err.message);
    res.status(err.statusCode || 500).json({ ok: false, error: err.message });
  } finally {
    if (cleanupDir) {
      await cleanupTempDir(cleanupDir);
    }
  }
});

// ─── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  const meta = getDeploymentMeta();
  const extra = [meta.branch, meta.commit].filter(Boolean).join(" @ ");
  console.log(`🚀 ${appName} v${meta.version} listening on port ${PORT}${extra ? ` (${extra})` : ""}`);
});

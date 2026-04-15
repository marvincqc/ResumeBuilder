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
const agencyLinksPath = path.join(rootDir, "config", "agency-links.json");
const appName = "JobReady";

app.use("/resume_output", express.static(resumeOutputDir));
app.use(express.static(path.join(rootDir, "public"), { index: false }));
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

function normalizeAgencyLinkSlug(value) {
  const cleaned = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return cleaned;
}

function readAgencyLinks() {
  try {
    const raw = fs.readFileSync(agencyLinksPath, "utf8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map(item => {
        const slug = normalizeAgencyLinkSlug(item.slug || item.code);
        const targetAgency = String(item.targetAgency || item.agency || "").trim();
        if (!slug || !targetAgency) return null;

        return {
          slug,
          targetAgency,
          partnerAgency: String(item.partnerAgency || item.sourceAgency || "").trim() || null,
          partnerCountry: String(item.partnerCountry || "").trim() || null,
          linkLabel: String(item.linkLabel || item.name || "").trim() || null,
          description: String(item.description || "").trim() || null,
          lockAgency: item.lockAgency !== false,
        };
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

function buildPartnerResumeUrl(link) {
  const params = new URLSearchParams();
  params.set("agency", link.targetAgency);
  params.set("partnerLinkCode", link.slug);
  if (link.partnerAgency) params.set("partnerAgency", link.partnerAgency);
  if (link.partnerCountry) params.set("partnerCountry", link.partnerCountry);
  if (link.linkLabel) params.set("linkLabel", link.linkLabel);
  if (link.lockAgency) params.set("lockAgency", "1");
  return `/resume?${params.toString()}`;
}

function buildSubmissionId(data) {
  const stamp = Date.now();
  const linkCode = sanitizeTempSegment(data?.partnerLinkCode || "", "").replace(/_/g, "-");
  return linkCode ? `web-${linkCode}-${stamp}` : `web-${stamp}`;
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

// ─── Main pages ───────────────────────────────────────────────────────────────
app.get("/", (_req, res) => res.sendFile(path.join(rootDir, "public", "home.html")));
app.get("/resume", (_req, res) => res.sendFile(path.join(rootDir, "public", "index.html")));
app.get("/apply/:slug", (req, res) => {
  const slug = normalizeAgencyLinkSlug(req.params.slug);
  const link = readAgencyLinks().find(item => item.slug === slug);
  if (!link) {
    return res.status(404).type("html").send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Link Not Found — JobReady</title>
  <style>
    body { font-family: Arial, sans-serif; background:#f4efe6; color:#13202b; margin:0; display:grid; place-items:center; min-height:100vh; padding:24px; }
    .card { max-width:560px; background:#fff; border-radius:24px; padding:32px; box-shadow:0 24px 60px rgba(12,18,24,0.14); }
    h1 { margin:0 0 12px; font-size:32px; }
    p { margin:0 0 18px; line-height:1.7; color:#62717f; }
    a { display:inline-flex; align-items:center; justify-content:center; min-height:46px; padding:0 18px; border-radius:999px; background:#13202b; color:#fff; text-decoration:none; font-weight:700; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Partner link not found</h1>
    <p>This application link is not active or may have been typed incorrectly. Please ask your agency for the correct JobReady link.</p>
    <a href="/">Go to JobReady Home</a>
  </div>
</body>
</html>`);
  }

  return res.redirect(buildPartnerResumeUrl(link));
});

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

    const submissionId = buildSubmissionId(data);
    const safeAttachments = Array.isArray(attachments) ? attachments : [];
    const result = await generateAndStorePDF(data, submissionId, safeAttachments);
    const partnerSuffix = data.partnerAgency
      ? ` via ${data.partnerAgency}${data.partnerCountry ? `, ${data.partnerCountry}` : ""}`
      : "";
    console.log(`✅ Submission: ${data.name} → ${data.agency}${partnerSuffix} (${safeAttachments.length} attachment(s))`);
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

import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

dotenv.config();
const app = express();
export default app;

app.use(express.json({ type: ["application/json", "application/csp-report"] }));
app.use(
  cors({
    origin: "http://localhost:3000", // React dev server
    credentials: true,
  })
);
app.use(helmet());

const cspDirectives = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'"],
  styleSrc: ["'self'"],
  imgSrc: ["'self'"],
  connectSrc: ["'self'", "http://localhost:5000"], 
  frameAncestors: ["'none'"],
  upgradeInsecureRequests: [],
};

app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      ...cspDirectives,
      "report-uri": ["/csp-report"],
    },
    reportOnly: process.env.NODE_ENV !== "production",
  })
);

app.post("/csp-report", (req, res) => {
  console.log("CSP Violation Report:", JSON.stringify(req.body, null, 2));
  res.sendStatus(204);
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

const authRoutes = require("./routes/authRoutes");
const { protect } = require("./middleware/authMiddleware");
app.use("/api/auth", authRoutes);

app.get("/api/protected", protect, (req, res) => {
  res.json({
    message: `Welcome, user ${req.user.id}!`,
    timestamp: new Date(),
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`SecureBlog API running at http://localhost:${PORT}`);
  console.log(
    `CSP mode: ${process.env.NODE_ENV !== "production" ? "REPORT-ONLY (dev)" : "ENFORCED (prod)"}`
  );
});

module.exports = app;

/*
References
ChatGPT, 2025. Final React Code. [Online] 
Available at: https://chatgpt.com/share/68d1af33-46ec-8010-90e9-e4d89e06c597
[Accessed 22 September 2025].


*/
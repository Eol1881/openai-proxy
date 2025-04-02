import express from "express";
import cors from "cors";
import morgan from "morgan";
import "dotenv/config";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();
const PORT = process.env.PORT;

// Enable CORS (if frontend and proxy are on different domains)
app.use(cors());

// Logging
app.use(morgan("dev"));

// Proxy configuration for OpenAI API
const openaiProxy = createProxyMiddleware({
  target: "https://api.openai.com", // Main OpenAI URL
  changeOrigin: true, // Changes Origin to target URL
  pathRewrite: { "^/openai": "" }, // Removes /openai from the path
  onProxyReq: (proxyReq, req) => {
    // Add OpenAI API key to headers (if not provided by client)
    if (!proxyReq.getHeader("Authorization")) {
      proxyReq.setHeader("Authorization", `Bearer ${process.env.OPENAI_API_KEY || "your_OpenAI_key"}`);
    }
  },
});

// Proxy requests from /openai to OpenAI
app.use("/openai", openaiProxy);

// Test endpoint
app.get("/", (req, res) => {
  res.send("OpenAI proxy server is working! 🚀");
});

// Start server
app.listen(PORT, () => {
  console.log(`Proxy server running at http://localhost:${PORT}`);
});

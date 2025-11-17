import multer from "multer";

export default function errorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        error: "File too large. Please upload a smaller image.",
      });
    }
    return res.status(400).json({ success: false, error: err.message });
  }

  if (err && err.message === "Only image files are allowed") {
    return res.status(400).json({ success: false, error: err.message });
  }

  // Generic error fallback
  console.error("Unhandled error:", err);
  return res.status(500).json({ success: false, error: "Internal server error" });
}

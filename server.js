const express = require("express");
const path = require("path");
const { exec } = require("child_process");
const fs = require("fs");
const app = express();
const PORT = 3000;

app.use(express.static("public"));
app.use(express.json());

app.post("/download", (req, res) => {
  const url = req.body.url;
  const tempOutput = "temp_video.mp4";
  const finalOutput = "video_converted.mp4";

  // Download video using yt-dlp (ensure the best quality is chosen)
  const ytdlpCommand = `yt-dlp -f "bv*+ba[ext=m4a]/b[ext=mp4]" --merge-output-format mp4 -o "${tempOutput}" "${url}"`;

  exec(ytdlpCommand, err => {
    if (err) {
      console.error("yt-dlp error:", err);
      return res.status(500).send("Video download failed.");
    }

    // Convert video to ensure compatibility using ffmpeg (H.264 video and AAC audio)
    const ffmpegCommand = `ffmpeg -y -i "${tempOutput}" -c:v libx264 -c:a aac -strict experimental "${finalOutput}"`;

    exec(ffmpegCommand, ffmpegErr => {
      if (ffmpegErr) {
        console.error("ffmpeg error:", ffmpegErr);
        return res.status(500).send("Video processing failed.");
      }

      // Send the final converted video as a download
      res.download(finalOutput, downloadErr => {
        if (downloadErr) {
          console.error("Download error:", downloadErr);
        }
        // Cleanup
        try {
          fs.unlinkSync(tempOutput); // Remove temp video file
          fs.unlinkSync(finalOutput); // Remove final output video file
        } catch (cleanupErr) {
          console.error("Cleanup error:", cleanupErr);
        }
      });
    });
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server running: http://localhost:${PORT}`);
});

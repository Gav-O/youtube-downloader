// public/script.js
async function download() {
  const url = document.getElementById("url").value;
  const status = document.getElementById("status");
  status.textContent = "Downloading...";

  const response = await fetch("/download", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
  });

  if (response.ok) {
    const blob = await response.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "video.mp4";
    a.click();
    status.textContent = "Download complete!";
  } else {
    const text = await response.text();
    status.textContent = `Error: ${text}`;
  }
}

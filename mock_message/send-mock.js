// send-mock.js
import fs from "fs";
import fetch from "node-fetch"; // 👉 npm install node-fetch

const API_URL = "http://localhost:3000/jobs/ingest";

// โหลด JSON จากไฟล์
const jobs = JSON.parse(fs.readFileSync("./mock-data.json", "utf-8"));

async function sendJobs() {
  for (const [i, job] of jobs.entries()) {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(job),
      });

      const data = await res.json();
      console.log(`✔️ Sent job ${i + 1}:`, job, "→ Response:", data);
    } catch (err) {
      console.error(`❌ Error sending job ${i + 1}`, err.message);
    }
  }
}

sendJobs();

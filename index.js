const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();
const fs = require("fs");
const path = require("path");

const app = express();
app.use(
  cors(
    { origin: "http://localhost:5173", credentials: true } // Adjust the origin as needed
  )
);
app.use(express.json());

const LOG_FILE = path.join(__dirname, "token_usage.log");

function logTokenUsage(tokens) {
  const now = new Date().toISOString();
  fs.appendFileSync(LOG_FILE, `${now} - Tokens used: ${tokens}\n`);
}

app.get("/", (req, res) => {
  res.send("Selamat datang di API Chatbot!");
});

app.get("/chat", (req, res) => {
  res.send(
    "Silakan kirim pesan ke endpoint POST /chat untuk berinteraksi dengan chatbot."
  );
});

app.post("/chat", async (req, res) => {
  const message = req.body.message;

  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [
          {
            role: "system",
            content:
              "Kamu adalah asisten AI yang membantu menjawab pertanyaan pengguna, baik mudah ataupun kompleks. Berikan jawaban yang ramah dan jelas. Gunakan bahasa Indonesia.",
          },
          { role: "user", content: message },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://example.com",
          "X-Title": "Chatbot Sederhana",
        },
      }
    );

    const reply = response.data.choices[0].message.content;
    const tokens = response.data.usage?.total_tokens || 0;

    logTokenUsage(tokens);

    res.json({ reply });
  } catch (err) {
    console.error(err?.response?.data || err.message);
    res.status(500).json({ reply: "Maaf, terjadi kesalahan pada sistem." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

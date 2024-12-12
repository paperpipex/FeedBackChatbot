// student.js

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { OpenAI } = require('openai');
const path = require('path');

// สร้าง instance OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();
app.use(bodyParser.json());

// เสิร์ฟไฟล์ static (student.html) จากโฟลเดอร์ปัจจุบัน
app.use(express.static(__dirname));

let feedbacks = []; // เก็บ feedback ไว้ใน memory

// ฟังก์ชันวิเคราะห์ sentiment ด้วย OpenAI
async function analyzeSentiment(feedbackText) {
  const prompt = `Please classify the following feedback into Positive, Neutral, or Negative sentiment only, respond with only one word: Positive, Neutral, or Negative.\n\nFeedback: "${feedbackText}"\nAnswer:`;

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {role: "system", content: "You are a sentiment classification assistant."},
      {role: "user", content: prompt}
    ],
    temperature: 0,
  });

  const sentiment = completion.choices[0].message.content.trim();
  return sentiment;
}

// Endpoint รับ feedback จากนักเรียน
app.post('/api/feedbacks', async (req, res) => {
  const { feedback_text } = req.body;
  if(!feedback_text) {
    return res.status(400).json({error: "feedback_text is required"});
  }

  try {
    const sentiment = await analyzeSentiment(feedback_text);
    const newFeedback = {
      id: feedbacks.length + 1,
      feedback_text,
      sentiment,
      timestamp: new Date().toISOString()
    };
    feedbacks.push(newFeedback);
    res.json(newFeedback);
  } catch (error) {
    console.error(error);
    res.status(500).json({error: "Error analyzing sentiment"});
  }
});

// Endpoint สำหรับให้ teacher.js เรียกดู feedback ทั้งหมด
app.get('/api/feedbacks', (req, res) => {
  res.json(feedbacks);
});

// หน้า default เสิร์ฟ student.html ให้เปิดดู UI ของนักเรียน
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'student.html'));
});

let port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Student server running at http://localhost:${port}`);
});

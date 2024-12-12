// teacher.js

require('dotenv').config();
const express = require('express');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
app.use(express.static(__dirname));

// ตั้งค่า URL ของ student server
// สมมุติ student server รันที่ http://localhost:3001
const STUDENT_SERVER_URL = 'http://localhost:3001';

app.get('/api/feedbacks', async (req, res) => {
  try {
    const response = await fetch(`${STUDENT_SERVER_URL}/api/feedbacks`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({error: "Cannot fetch feedbacks from student server."});
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'teacher.html'));
});

const port = 3002; // อาจารย์สตาร์ทคนละพอร์ต
app.listen(port, () => {
  console.log(`Teacher server running at http://localhost:${port}`);
});

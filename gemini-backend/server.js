// Gemini Trip Planner Proxy (Node.js Express)

const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch'); // using node-fetch v2
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.use(bodyParser.json());

app.post('/api/plan-trip', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
      }),
    });

    const statusCode = response.status;
    const resultText = await response.text();
    console.log('Gemini API Status:', statusCode);
    console.log('Gemini Raw Response:', resultText);

    let result;
    try {
      result = JSON.parse(resultText);
    } catch (e) {
      return res.status(500).json({ error: 'Invalid response from Gemini (not JSON)' });
    }

    if (result?.candidates?.[0]?.content?.parts?.[0]?.text) {
      res.status(200).json({ plan: result.candidates[0].content.parts[0].text });
    } else {
      res.status(500).json({ error: 'No valid response from Gemini.' });
    }
  } catch (err) {
    console.error('Error calling Gemini:', err);
    res.status(500).json({ error: 'Failed to fetch from Gemini' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
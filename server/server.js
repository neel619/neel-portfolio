const MY_PROFILE = `
Name: Neel Rakhade
Role: Web Developer / Student

Skills:
- HTML
- CSS
- JavaScript
- React (basic)
- Node.js (basic)
- Express.js
- MongoDB (basic)
- Git & GitHub
- C# (basic)
- .NET (basic)
- React Native (basic)
- Java (basic)
- Python (basic)
-Cyber Security (learning)

Projects:
- AI Portfolio Assistant (this website)
- Fur Family Finders (Pet Adoption Website)
- Jackfruit Daily Website
- Weather App
- Fitness Tracking App (Using C# and .NET)
- Holistic Telehealth and fitness integration app (Using React Native)

Experience:
- Internship where I learned HTML, CSS, JavaScript, React, Node.js
- Currently doing cyber security course

Education:
- Currently in Vidyalankar Institute for International Education (VIIE)
- Pursuing Bachelor's in Computer Science from University of Central Lanchashire (UCLan)
- Completed various online courses on web development and AI
- Specialization in Cyber Security

- Instagram: https://www.instagram.com/neelrakhade/
- GitHub: https://github.com/neel619
- LinkedIn: https://www.linkedin.com/in/neel-rakhade-571785272/

Perseonal Details:
- Age : 19
- Location: Kalyan, Maharashtra, India
- Height: 6'7"
`;

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

console.log("🔥 REAL SERVER FILE LOADED");

const app = express();
app.use(cors());
app.use(express.json());

/*
  Models available to YOUR account (confirmed via ListModels):
  - gemini-2.5-flash
  - gemini-2.5-flash-lite
*/
const MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite"
];

async function callGemini(model, prompt, apiKey) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      })
    }
  );

  return response.json();
}

app.post("/chat", async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const userMessage = req.body.message;

    if (!apiKey) {
      return res.json({ reply: "❌ API key missing" });
    }

    if (!userMessage) {
      return res.json({ reply: "❌ Empty message" });
    }

    const prompt = `
You are Neel's personal AI assistant.

Here is the ONLY verified information about Neel:
${MY_PROFILE}

STRICT RULES:
- Answer ONLY using the information above
- DO NOT add or assume any skills
- DO NOT mention technologies not listed
- If something is not mentioned, say:
  "I don't have that information."

User question:
${userMessage}
`;


    // Try models one by one (fallback strategy)
    for (const model of MODELS) {
      console.log(`🔄 Trying model: ${model}`);

      const data = await callGemini(model, prompt, apiKey);
      console.log("🧠 RAW RESPONSE:", JSON.stringify(data, null, 2));

      // Success case
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        return res.json({ reply: text });
      }

      // Overload → try next model
      if (data?.error?.code === 503) {
        console.log(`⚠️ ${model} overloaded, trying fallback...`);
        continue;
      }

      // Other API error
      if (data?.error) {
        console.log(`❌ ${model} error:`, data.error.message);
      }
    }

    // If all models failed
    res.json({
      reply: "⚠️ AI is currently busy. Please try again in a moment."
    });

  } catch (error) {
    console.error("❌ SERVER ERROR:", error);
    res.json({
      reply: "❌ Server error. Check backend logs."
    });
  }
});

app.listen(5000, () => {
  console.log("🚀 AI server running on port 5000");
});

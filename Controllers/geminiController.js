const expressAsyncHandler = require("express-async-handler");
const { GoogleGenAI } = require("@google/generative-ai");
const dotenv = require("dotenv");

dotenv.config();

const geminiReply = expressAsyncHandler(async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  console.log(prompt);

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    const reply = response.text; 
    console.log(reply);

    res.status(200).send({ reply });
  } catch (error) {
    console.error("Error generating content:", error);
    res.status(500).json({ error: "Failed to generate AI response" });
  }
});

module.exports = { geminiReply };

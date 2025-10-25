import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { imageBase64, mimeType } = req.body;
  const apiKey = process.env.GOOGLE_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp-image-generation",
  });

  const prompt = `
  Using the model, create a 1/7 scale commercialized figurine of the characters in the picture, in a realistic style, in a real environment. The figurine is placed on a computer desk. The figurine has a round transparent acrylic base, with no text on the base. The content on the computer screen is the Zbrush modeling process of this figurine. Next to the computer screen is a BANDAI-style toy packaging box printed with the original artwork. The packaging features two-dimensional flat illustrations..
  `;

  try {
    const result = await model.generateContent([
      { text: prompt },
      { inlineData: { mimeType, data: imageBase64 } },
    ]);
    const part = result.response.candidates[0].content.parts.find(
      (p) => p.inlineData
    );
    if (part) {
      res.status(200).json({ image: part.inlineData.data });
    } else {
      res.status(500).json({ error: "No image generated" });
    }
  } catch (err) {
  console.error("Error from API:", err);
  res.status(500).json({ error: err.message || "Unknown error" });
}
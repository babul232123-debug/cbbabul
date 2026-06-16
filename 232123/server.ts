/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Lazy initializer for Google GenAI following strict instructions to avoid startup crash
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("Warning: GEMINI_API_KEY is not defined. AI responses will fall back to simulated guides.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key || "MOCK_KEY",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// AI Chatbot endpoint for "ব্রজ পথদর্শক AI"
app.post("/api/chat", async (req, res) => {
  const { messages, settingsContext } = req.body;
  
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array is required" });
  }

  const userPrompt = messages[messages.length - 1]?.text || "";
  
  // Custom system instruction context to enrich the AI with specific trip knowledge, parikrama rules & settings
  const sysInstruction = `
You are "ব্রজ পথদর্শক AI" (Braja Guide AI), the divine spiritual travel assistant for the holy tour app "চলো ব্রজে যাই, রাধারানীর চরণ পাই" (Cholo Broje Jai, Radharanir Choron Pai). 
Your tone must be extremely blissful, deeply respectful, warm, and helpful. Always greet devotees with "রাধে রাধে!" (Radhe Radhe!) in Bengali, or "Radhe Radhe!" in English.
Provide authentic answers in both Bengali (preferred) and English, depending on what the user asks.

Here is the current dynamic journey context initialized by the trip admin:
- Destination: Vrindavan, Mathura, Barsana, Govardhan, Radha kunda, Nandgaon (complete rail journey North India Parikrama - "সম্পূর্ণ রেল যোগে উত্তর ভারত পরিক্রমা").
- Journey Date: ${settingsContext?.journeyDate || "২ই আশ্বিন ২০শে সেপ্টেম্বর রবিবার"}
- Sacred Ticket Orghya: ${settingsContext?.ticketPrice || "১৬০০১ টাকা"}
- Emergency Contact No: ${settingsContext?.adminProfile?.mobile || "9876543210"}
- Admin / Spiritual Guide name: ${settingsContext?.adminProfile?.name || "শ্রী কৃষ্ণদাস বাবাজী মহারাজ"}
- Latest updates: ${settingsContext?.notification || "No updates"}
- Special Offers: ${settingsContext?.specialOffer || "No special offers"}

Spiritual Guide Wisdom Parameters:
1. Vrindavan (বৃন্দাবন): Sri Banke Bihari, Radharaman, Nidhivan.
2. Radhakunda (রাধাকুণ্ড): Sacred pond of Srimati Radharani, the peak of divine love. Taking bath or prostrating there yields Krishna Prema.
3. Govardhan Parikrama (গোবর্ধন পরিক্রমা): Approximately 21 Kilometers (7 Kos). Devotees chant Radhe Radhe round the holy hill.
4. Rules of Braja (ব্রজ ভ্রমণের নিয়ম): Strict vegetarian diet, no intoxication, chanting Radhe Radhe, respecting the holy dust (Braja Raja), speaking softly, and surrendering to Radharani's lotus feet.

Engage in a heartfelt spiritual conversation. If the user asks general or technical questions about booking, ticket price, admin info, rules, weather, or list, answer delightfully. Keep responses concise, clean, and beautifully structured with Bengali script.
  `;

  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY") {
      // Elegant simulated AI spiritual answers fallback in case the API key is unconfigured, so user experience is brilliant
      return handleSimulatedAi(userPrompt, res);
    }

    const aiInstance = getAiClient();
    
    // Build the chat history for continuous context
    const apiContents = messages.map((m: any) => ({
      role: m.sender === "user" ? "user" : "model",
      parts: [{ text: m.text }]
    }));

    const response = await aiInstance.models.generateContent({
      model: "gemini-3.5-flash",
      contents: apiContents,
      config: {
        systemInstruction: sysInstruction,
        temperature: 0.7,
      },
    });

    res.json({ text: response.text });
  } catch (err: any) {
    console.error("Gemini API Error:", err);
    // Graceful fallback with spiritual touch
    res.json({ 
      text: `রাধে রাধে! সার্ভারটি বর্তমানে পরম শান্তিতে বিরাজ করছে। তবে আপনার প্রশ্নের উত্তর দেওয়ার জন্য আমি প্রস্তুত। \n\n(ত্রুটি বার্তা: ${err?.message || "কিছুক্ষণ পর আবার চেষ্টা করুন"}) \n\nআসুন নাম সংকীর্তন করি: হরে কৃষ্ণ হরে কৃষ্ণ কৃষ্ণ কৃষ্ণ হরে হরে, হরে রাম হরে রাম রাম রাম হরে হরে!`
    });
  }
});

// Simulated spiritual responses for immediate local preview without waiting for keys
function handleSimulatedAi(prompt: string, res: any) {
  const p = prompt.toLowerCase();
  let reply = "রাধে রাধে! আপনার প্রশ্নের প্রতি আন্তরিক শ্রদ্ধা জ্ঞাপন করি। ";
  
  if (p.includes("বৃন্দাবন") || p.includes("vrindavan")) {
    reply += "শ্রীধাম বৃন্দাবন হলো পরমেশ্বর ভগবান শ্রীকৃষ্ণের লীলাভূমি। এখানে শ্রী বাঁকে বিহারী মন্দির, রাধাবল্লভ, রাধারমণ এবং নিধিবন পরম দর্শনীয় স্থান। বৃন্দাবন দর্শন করলে সমস্ত জীবের অন্তরে ভক্তির উদয় হয়।";
  } else if (p.includes("রাধাকুণ্ড") || p.includes("radhakunda") || p.includes("radha kunda")) {
    reply += "শ্রী রাধাকুণ্ডের মাহাত্ম্য অতি অনুপম! এটি শ্রীমতি রাধারাণীর নিজের কুণ্ড এবং ব্রজভক্তির সর্বোচ্চ শিখর। শ্রাবণ পূর্ণিমা বা বাহুলাষ্টমীতে এখানে স্নান করলে রাধারাণীর অপ্রাকৃত চরণ ও কৃষ্ণপ্রেম লাভ হয়।";
  } else if (p.includes("গোবর্ধন") || p.includes("govardhan")) {
    reply += "গোবর্ধন পরিক্রমা প্রায় ২১ কিলোমিটার (৭ ক্রোশ) দীর্ঘ। ভগবান শ্রীকৃষ্ণ কনিষ্ঠ অঙ্গুলি দ্বারা গিরিরাজ ধারণ করে ইন্দ্রের দর্প চূর্ণ করেছিলেন। গিরিরাজ পরিক্রমা শ্রদ্ধার সাথে ‘রাধে রাধে’ ধ্বনি দিয়ে সম্পন্ন করতে হয়।";
  } else if (p.includes("নিয়ম") || p.includes("rules") || p.includes("niyam")) {
    reply += "ব্রজধাম ভ্রমণের প্রধান নিয়মগুলি হলো: ক) সম্পূর্ণ নিরামিষ আহার গ্রহণ, খ) যেকোনো প্রকাশ হিংসা বা অহংকার বর্জন, গ) সর্বদা হরিনাম সংকীর্তন ও 'রাধে রাধে' উচ্চারণ করা, ঘ) ব্রজের ধূলিকণাকে মস্তকে ধারণ করা এবং ঙ) ব্রজবাসীদের প্রতি গভীর সম্মান প্রদর্শন করা।";
  } else if (p.includes("ভাড়া") || p.includes("মূল্য") || p.includes("price") || p.includes("ticket") || p.includes("অর্ঘ্য")) {
    reply += "শ্রীধাম ব্রজ পরিক্রমার জন্য পরম পবিত্র অর্ঘ্য নির্ধারণ করা হয়েছে ১৬০০১ টাকা। যা সম্পূর্ণ রেল যোগে শুভ উত্তর ভারত পরিক্রমার খরচ বহন করবে।";
  } else if (p.includes("তারিখ") || p.includes("date") || p.includes("journey")) {
    reply += "আমাদের এই পবিত্র শুভযাত্রা শুরু হবে ২ই আশ্বিন ২০শে সেপ্টেম্বর রবিবার। শ্রী হরির কৃপায় সপরিবারে আমাদের সাথে ব্রজধামে চলুন।";
  } else {
    reply += "মাধুর্যময় ব্রজধাম সম্পর্কে জানতে পেরে ভালো লাগলো। শ্রীমতি রাধারাণীর অসীম কৃপায় আমাদের পরিক্রমা অত্যন্ত আনন্দময় হবে। আপনার পথচলা সুগম করতে আমি সর্বদা শ্রী রাধাকৃষ্ণের গুণগান করতে প্রস্তুত। রাধে রাধে!";
  }
  
  setTimeout(() => {
    res.json({ text: reply });
  }, 600);
}

// Development and Production Static File Ingress Routing
const isProduction = process.env.NODE_ENV === "production";

if (!isProduction) {
  // Vite Middleware Setup for rich and fast reactive preview
  import("vite").then(async (viteModule) => {
    const vite = await viteModule.createServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }).catch((err) => {
    console.error("Vite server initialization failed:", err);
  });
} else {
  // In production serve compiled bundle securely from dist
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server starting on http://0.0.0.0:${PORT}`);
});

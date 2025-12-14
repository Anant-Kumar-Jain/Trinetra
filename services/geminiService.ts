import { GoogleGenAI } from "@google/genai";
import { AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const verifyLocationContext = async (locationName: string, lat: number, lng: number): Promise<{ verified: boolean; summary: string }> => {
  try {
    // Note: responseMimeType is NOT supported when using the googleMaps tool.
    // We must parse the text response manually.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Verify if the location "${locationName}" logically exists near the coordinates Latitude: ${lat}, Longitude: ${lng}. 
      Use Google Maps data to check nearby landmarks. 
      Return a valid JSON string object with "verified" (boolean) and "summary" (string).`,
      config: {
        tools: [{ googleMaps: {} }]
      }
    });

    let text = response.text || "{}";
    
    // Clean up potential markdown formatting from the response
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // Attempt to extract JSON if it's embedded in text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        text = jsonMatch[0];
    }

    try {
        return JSON.parse(text);
    } catch (e) {
        console.warn("JSON parse failed for Maps verification, returning default.", text);
        return { verified: false, summary: "Verification result parsing failed." };
    }
  } catch (error) {
    console.error("Maps Verification Failed:", error);
    return { verified: false, summary: "Could not verify location connectivity." };
  }
};

// Deprecated single-image function, routed to analyzeFrame now for consistency if needed, 
// but keeping for legacy calls if any.
export const analyzePrivacy = async (base64Image: string): Promise<{ recommended: boolean; reason: string }> => {
  const result = await analyzeFrame([base64Image], 'PRIVACY');
  return { 
      recommended: result.privacyRecommendation || false, 
      reason: result.text 
  };
};

export const analyzeFrame = async (
    base64Images: string[], 
    mode: 'OBJECTS' | 'ANOMALY' | 'FACE' | 'ANPR' | 'PRIVACY' | 'SEARCH',
    targetDescription?: string
): Promise<AnalysisResult> => {
  
  if (!base64Images || base64Images.length === 0) {
      console.error("Invalid base64 image data");
      return {
          text: "Error: Video frame capture failed. Data is empty.",
          detectedObjects: [],
          safetyScore: 0
      };
  }

  try {
    let prompt = "";
    let model = "gemini-2.5-flash"; // Default
    let outputJson = false;

    // Prepare content parts with all frames
    const parts: any[] = base64Images.map(img => ({
        inlineData: {
            mimeType: 'image/jpeg',
            data: img
        }
    }));

    switch (mode) {
      case 'ANPR':
        prompt = "Analyze these video frames for vehicles. Identify the vehicle model, color, and attempt to read any visible license plates (ANPR). Return a structured list of vehicles.";
        break;
      case 'FACE':
        prompt = "Analyze these video frames for human biometrics. Describe the individuals present (clothing, estimated age, gender, activity) for identification purposes. Do NOT output real names. Assess crowd mood.";
        break;
      case 'SEARCH':
        model = "gemini-3-pro-preview"; // High intelligence for matching
        prompt = `Analyze these video frames sequence. Search specifically for a person matching this description: "${targetDescription}".
        
        Return a JSON object:
        {
            "matchFound": boolean,
            "confidence": "HIGH" | "MEDIUM" | "LOW" | "NONE",
            "description": "Describe the person found or why no match was found.",
            "timestamp": "Time offset in frames if relevant"
        }`;
        outputJson = true;
        break;
      case 'ANOMALY':
        prompt = "Analyze these video frames for security anomalies. Look for: Sudden speed drops, accidents, fire, smoke, weapons, fighting, or running people. Return a short, urgent report.";
        break;
      case 'PRIVACY':
        model = "gemini-3-pro-preview"; 
        prompt = `Conduct a privacy audit on this video sequence. 
        Check for clearly visible faces or PII (Personally Identifiable Information) that persists across frames.
        
        Return a JSON object with this structure:
        {
          "summary": "Brief description of privacy risks found or 'No privacy risks detected'.",
          "risks": ["Face visible", "License plate visible", "Private interior"], 
          "recommendBlur": boolean
        }
        If faces are clear and identifiable, set recommendBlur to true.`;
        outputJson = true;
        break;
      case 'OBJECTS':
      default:
        prompt = "List all major physical objects visible in these video frames (e.g., cars, people, bags, signs, animals). Provide the list as comma-separated values.";
        break;
    }

    parts.push({ text: prompt });

    const config = outputJson ? { responseMimeType: "application/json" } : {};

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: parts
      },
      config: config
    });

    const text = response.text || "";
    
    let detectedObjects: string[] = [];
    let privacyRecommendation = false;
    let matchFound = false;
    let finalText = text;

    if (outputJson) {
        try {
            const json = JSON.parse(text);
            if (mode === 'PRIVACY') {
                finalText = json.summary || "Privacy Audit Completed.";
                privacyRecommendation = json.recommendBlur || false;
                if (json.risks && Array.isArray(json.risks)) {
                    detectedObjects = json.risks;
                }
            } else if (mode === 'SEARCH') {
                matchFound = json.matchFound || false;
                finalText = json.description || (matchFound ? "Target matched in video feed." : "Target not found.");
                if (matchFound) detectedObjects.push("Target Match");
            }
        } catch (e) {
            console.error("Failed to parse JSON response", e);
            finalText = "Error parsing AI report.";
        }
    } else {
         if (mode === 'OBJECTS') {
             const items = text.split(/,|:|\n/).map(s => s.trim()).filter(s => s.length > 2);
             detectedObjects = items.slice(0, 10); 
         } else {
              detectedObjects = (text.match(/\b(car|person|truck|bus|fire|smoke|weapon|dog|cat|bag|backpack)\b/gi) || []) as string[];
         }
         finalText = text;
    }
    
    // Safety score logic
    const dangerKeywords = ['fire', 'accident', 'weapon', 'fighting', 'blood', 'crash', 'robbery', 'gun', 'knife'];
    const isDangerous = dangerKeywords.some(k => finalText.toLowerCase().includes(k));
    const safetyScore = isDangerous ? 30 : 95;

    return {
      text: finalText,
      detectedObjects: Array.from(new Set(detectedObjects.map(s => s.toLowerCase()))),
      safetyScore,
      anprCandidates: (finalText.match(/[A-Z]{2}[ -]?[0-9]{2}[ -]?[A-Z]{1,2}[ -]?[0-9]{4}/g) || []) as string[],
      privacyRecommendation,
      matchFound
    };

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      text: "System offline or analysis failed.",
      detectedObjects: [],
      safetyScore: 0
    };
  }
};
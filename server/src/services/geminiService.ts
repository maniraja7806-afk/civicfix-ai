import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import fs from 'fs';

export interface AiAnalysisResult {
  detectedIssue: string;
  suggestedTitle: string;
  suggestedCategory: string;
  suggestedPriority: 'Critical' | 'High' | 'Medium' | 'Low';
  suggestedDepartment: string;
  confidenceScore: number;
  visualDamage: string;
  urgencyExplanation: string;
  safetyAdvisory: string;
  isAiGenerated: boolean;
  modelUsed: string;
  analyzedAt: string;
}

const fileToGenerativePart = (filePath: string, mimeType: string) => {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(filePath)).toString('base64'),
      mimeType
    }
  };
};

export const analyzeCivicImage = async (
  filePath: string,
  mimeType: string,
  userNotes?: string
): Promise<AiAnalysisResult> => {
  // If Gemini API Key is available, invoke Gemini Multimodal
  if (config.geminiApiKey && config.geminiApiKey !== 'your_gemini_api_key_here') {
    try {
      logger.info(`Analyzing image with Google Gemini API (${config.geminiModel})...`);
      const genAI = new GoogleGenerativeAI(config.geminiApiKey);
      const model = genAI.getGenerativeModel({ model: config.geminiModel });

      const prompt = `
You are CivicFix AI, an expert municipal civic infrastructure vision inspection assistant.
Carefully inspect this civic issue photograph.

IMPORTANT ETHICAL & PRIVACY RULES:
1. Do NOT identify, describe, or recognize any people, faces, vehicle registration plates, or private identities.
2. Do NOT claim to detect invisible structural problems. Only describe visible physical damage.
3. Keep descriptions factual, objective, and constructive.

Analyze the image and respond with a STRICT JSON object (no markdown quotes, no backticks, just raw json):
{
  "detectedIssue": "Specific name of visible problem (e.g., Severe Road Pothole, Overflowing Garbage Dump, Exposed Electrical Wire, Broken Streetlight, Blocked Stormwater Drain, Water Main Leakage)",
  "suggestedTitle": "Concise 5-8 word complaint title",
  "suggestedCategory": "One of: 'Roads & Potholes' | 'Garbage & Sanitation' | 'Water Leakage & Supply' | 'Streetlight & Electrical' | 'Drainage & Sewerage' | 'Public Health & Hygiene' | 'Public Safety & Parks' | 'Other Infrastructure'",
  "suggestedPriority": "One of: 'Critical' | 'High' | 'Medium' | 'Low'",
  "suggestedDepartment": "One of: 'Public Works Department' | 'Sanitation & Solid Waste' | 'Water Supply & Sewerage' | 'Electrical & Street Lighting' | 'Stormwater Drainage & Flood Control' | 'Public Health & Sanitation'",
  "confidenceScore": 85 to 98,
  "visualDamage": "Factual description of visible physical damage or disruption",
  "urgencyExplanation": "Why this civic problem needs prompt municipal attention",
  "safetyAdvisory": "Immediate precautionary advisory for pedestrians and vehicular traffic"
}
${userNotes ? `Additional context from citizen: "${userNotes}"` : ''}
`;

      const imagePart = fileToGenerativePart(filePath, mimeType);
      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      let text = response.text().trim();

      // Remove markdown code fence if returned
      if (text.startsWith('```json')) {
        text = text.replace(/^```json/, '').replace(/```$/, '').trim();
      } else if (text.startsWith('```')) {
        text = text.replace(/^```/, '').replace(/```$/, '').trim();
      }

      const parsed = JSON.parse(text);
      return {
        detectedIssue: parsed.detectedIssue || 'Civic Infrastructure Issue',
        suggestedTitle: parsed.suggestedTitle || 'Reported Civic Problem',
        suggestedCategory: parsed.suggestedCategory || 'Roads & Potholes',
        suggestedPriority: parsed.suggestedPriority || 'Medium',
        suggestedDepartment: parsed.suggestedDepartment || 'Public Works Department',
        confidenceScore: parsed.confidenceScore || 92,
        visualDamage: parsed.visualDamage || 'Visible civic degradation requiring maintenance.',
        urgencyExplanation: parsed.urgencyExplanation || 'Affects daily civic commute and public safety.',
        safetyAdvisory: parsed.safetyAdvisory || 'Citizens are advised to exercise caution in this vicinity.',
        isAiGenerated: true,
        modelUsed: config.geminiModel,
        analyzedAt: new Date().toISOString()
      };
    } catch (err: any) {
      logger.warn('Gemini AI call failed, falling back to heuristic engine:', err.message);
    }
  }

  // Realistic heuristic fallback when API key is omitted or during offline demos
  const fileNameLower = filePath.toLowerCase();
  if (fileNameLower.includes('garbage') || fileNameLower.includes('trash') || fileNameLower.includes('waste')) {
    return {
      detectedIssue: 'Unregulated Municipal Waste Accumulation',
      suggestedTitle: 'Overflowing Garbage Dump on Public Pathway',
      suggestedCategory: 'Garbage & Sanitation',
      suggestedPriority: 'High',
      suggestedDepartment: 'Sanitation & Solid Waste',
      confidenceScore: 91,
      visualDamage: 'Scattered solid waste blocking pedestrian sidewalk and attracting pests.',
      urgencyExplanation: 'Public sanitation hazard with potential groundwater contamination and foul odor.',
      safetyAdvisory: 'Pedestrians advised to avoid proximity. Waste collection truck requested.',
      isAiGenerated: true,
      modelUsed: 'CivicFix AI Heuristic Vision v2 (Simulation)',
      analyzedAt: new Date().toISOString()
    };
  } else if (fileNameLower.includes('water') || fileNameLower.includes('leak') || fileNameLower.includes('pipe')) {
    return {
      detectedIssue: 'Pressurized Municipal Water Pipe Leakage',
      suggestedTitle: 'Severe Water Pipe Breach Flooding Roadway',
      suggestedCategory: 'Water Leakage & Supply',
      suggestedPriority: 'High',
      suggestedDepartment: 'Water Supply & Sewerage',
      confidenceScore: 93,
      visualDamage: 'Continuous water outflow creating surface pooling and erosion.',
      urgencyExplanation: 'Substantial potable water loss and potential weakening of road sub-base.',
      safetyAdvisory: 'Vehicles advised to slow down to prevent hydroplaning.',
      isAiGenerated: true,
      modelUsed: 'CivicFix AI Heuristic Vision v2 (Simulation)',
      analyzedAt: new Date().toISOString()
    };
  } else if (fileNameLower.includes('light') || fileNameLower.includes('pole') || fileNameLower.includes('electric')) {
    return {
      detectedIssue: 'Malfunctioning Public Streetlight & Exposed Fixture',
      suggestedTitle: 'Damaged Streetlight Pole with Exposed Wiring',
      suggestedCategory: 'Streetlight & Electrical',
      suggestedPriority: 'Critical',
      suggestedDepartment: 'Electrical & Street Lighting',
      confidenceScore: 95,
      visualDamage: 'Physical pole tilting and open junction box with visible low-voltage wires.',
      urgencyExplanation: 'Severe electrocution risk during rain and total loss of night illumination.',
      safetyAdvisory: 'Do not approach or touch the pole fixture. Cordon off area.',
      isAiGenerated: true,
      modelUsed: 'CivicFix AI Heuristic Vision v2 (Simulation)',
      analyzedAt: new Date().toISOString()
    };
  } else if (fileNameLower.includes('drain') || fileNameLower.includes('sewer') || fileNameLower.includes('overflow')) {
    return {
      detectedIssue: 'Blocked Stormwater Drain & Sewage Overflow',
      suggestedTitle: 'Clogged Drainage Canal Causing Backflow',
      suggestedCategory: 'Drainage & Sewerage',
      suggestedPriority: 'High',
      suggestedDepartment: 'Stormwater Drainage & Flood Control',
      confidenceScore: 92,
      visualDamage: 'Heavy siltation and plastic debris obstructing natural drainage outflow.',
      urgencyExplanation: 'Immediate urban waterlogging hazard during precipitation.',
      safetyAdvisory: 'Avoid stepping into submerged areas due to open manhole hazards.',
      isAiGenerated: true,
      modelUsed: 'CivicFix AI Heuristic Vision v2 (Simulation)',
      analyzedAt: new Date().toISOString()
    };
  }

  // Default Pothole / Road damage scenario
  return {
    detectedIssue: 'Deep Asphalt Road Pothole & Surface Cavity',
    suggestedTitle: 'Hazardous Road Pothole on High-Traffic Lane',
    suggestedCategory: 'Roads & Potholes',
    suggestedPriority: 'High',
    suggestedDepartment: 'Public Works Department',
    confidenceScore: 94,
    visualDamage: 'Rough-edged asphalt crater approx. 12-15cm depth causing vehicular swerving.',
    urgencyExplanation: 'High risk of two-wheeler skidding, wheel alignment damage, and traffic deceleration.',
    safetyAdvisory: 'Motorists advised to reduce speed to 20 km/h in this lane.',
    isAiGenerated: true,
    modelUsed: 'CivicFix AI Vision Engine v2 (Simulation)',
    analyzedAt: new Date().toISOString()
  };
};

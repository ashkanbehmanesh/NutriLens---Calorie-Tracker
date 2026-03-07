
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, Gender, Goal, ActivityLevel, WeightGoalSpeed } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const calculatePersonalizedGoals = async (profile: Partial<UserProfile>): Promise<{ targetCalories: number, macros: { protein: number, carbs: number, fat: number } }> => {
  const prompt = `
    Based on the following user data:
    Name: ${profile.name}
    Weight: ${profile.weight}kg
    Height: ${profile.height}cm
    Gender: ${profile.gender}
    Goal: ${profile.goal}
    Goal Pace: ${profile.weightGoalSpeed} (Relaxed/Steady/Aggressive)
    Daily Activity Level: ${profile.activityLevel}
    Specific Sports/Exercise: ${profile.sportsInfo || 'None specified'}
    
    Optional measurements: 
    Waist: ${profile.waist}cm, Hips: ${profile.hips}cm, Chest: ${profile.chest}cm

    Calculate the recommended daily calorie intake and macro nutrients (Protein, Carbs, Fat in grams). 
    Account for the specific pace: 
    - Relaxed is approx 0.25kg/week change.
    - Steady is approx 0.5kg/week change.
    - Aggressive is approx 1kg/week change.
    
    If goal is "Steady Weight", ignore pace and calculate maintenance.
    Return the result in JSON format.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          targetCalories: { type: Type.NUMBER },
          macros: {
            type: Type.OBJECT,
            properties: {
              protein: { type: Type.NUMBER },
              carbs: { type: Type.NUMBER },
              fat: { type: Type.NUMBER }
            },
            required: ['protein', 'carbs', 'fat']
          }
        },
        required: ['targetCalories', 'macros']
      }
    }
  });

  return JSON.parse(response.text);
};

export const estimateMealCalories = async (
  mealDescription: string,
  base64Image?: string
): Promise<{ name: string, calories: number, protein: number, carbs: number, fat: number }> => {
  const parts: any[] = [{ text: `Estimate the calories and macros (protein, carbs, fat in grams) for this meal: "${mealDescription}". If an image is provided, use it to increase accuracy. Return JSON format.` }];
  
  if (base64Image) {
    parts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: base64Image.split(',')[1] // remove data:image/jpeg;base64,
      }
    });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          calories: { type: Type.NUMBER },
          protein: { type: Type.NUMBER },
          carbs: { type: Type.NUMBER },
          fat: { type: Type.NUMBER }
        },
        required: ['name', 'calories', 'protein', 'carbs', 'fat']
      }
    }
  });

  return JSON.parse(response.text);
};

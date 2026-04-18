// Gemini API wrapper for BudgetOS agents
// API key is read from environment: VITE_GEMINI_API_KEY

const MODEL = 'gemini-2.5-flash';

export async function callGemini(messages, systemPrompt = 'You are a government budget analyst AI specializing in Indian district finances.') {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('VITE_GEMINI_API_KEY is not set. Please add it to your .env file.');
  }

  // Convert Claude message format to Gemini format
  const geminiContents = messages.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }]
  }));

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: geminiContents,
      generationConfig: {
        temperature: 0.2,
      }
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Gemini API error ${response.status}: ${errorData?.error?.message || response.statusText}`);
  }

  const data = await response.json();
  
  // Extract text from Gemini response
  const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!responseText) {
    throw new Error('Invalid response format from Gemini API');
  }
  
  return responseText;
}

export function parseJSON(text) {
  try {
    // Strip markdown code fences
    const cleaned = text
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim();
    
    // Find JSON object or array
    const jsonMatch = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return JSON.parse(cleaned);
  } catch (e) {
    console.warn('JSON parse failed:', e.message, '\nRaw text:', text);
    return null;
  }
}

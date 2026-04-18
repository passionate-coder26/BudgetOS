// Claude API wrapper for BudgetOS agents
// API key is read from environment: VITE_ANTHROPIC_API_KEY

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';
const MAX_TOKENS = 1000;

export async function callClaude(messages, systemPrompt = 'You are a government budget analyst AI specializing in Indian district finances.') {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    throw new Error('VITE_ANTHROPIC_API_KEY is not set. Please add it to your .env file.');
  }

  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Claude API error ${response.status}: ${errorData?.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.content[0].text;
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

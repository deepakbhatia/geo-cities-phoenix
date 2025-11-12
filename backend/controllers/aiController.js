import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generatePublicSquare = async (req, res) => {
  try {
    const { cityId } = req.params;
    const { cityName, theme, recentActivity } = req.body;
    
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `You are the AI curator of "${cityName}", a ${theme}-themed neighborhood in GeoCities AI.
    
Recent activity: ${recentActivity || 'New city, no activity yet'}

Write a brief, engaging public square announcement (2-3 sentences) summarizing what's happening in the city. Be creative and match the ${theme} vibe.`;

    const result = await model.generateContent(prompt);
    const summary = result.response.text();
    
    res.json({ cityId, summary, generatedAt: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const generateNewsletter = async (req, res) => {
  try {
    const { cityId } = req.params;
    const { cityName, theme, pages } = req.body;
    
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `You are an AI journalist for "${cityName}", a ${theme}-themed neighborhood.
    
Recent pages: ${pages?.length || 0} new AI-generated pages

Write a newsletter (3-4 paragraphs) covering:
1. Highlights of new content
2. Emerging trends in the city
3. What makes this city unique

Be engaging and match the ${theme} aesthetic.`;

    const result = await model.generateContent(prompt);
    const newsletter = result.response.text();
    
    res.json({ cityId, newsletter, generatedAt: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const generateRadio = async (req, res) => {
  try {
    const { cityId } = req.params;
    const { cityName, vibe } = req.body;
    
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `Describe the soundtrack for "${cityName}" radio station with a ${vibe} vibe.
    
Provide:
1. Genre/style
2. Mood descriptors
3. 3 fictional song titles that would play

Keep it brief and atmospheric.`;

    const result = await model.generateContent(prompt);
    const radioDescription = result.response.text();
    
    res.json({ cityId, radioDescription, generatedAt: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

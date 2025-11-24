import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize GoogleGenerativeAI with API key from environment
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Configure gemini-pro model for text generation
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

// Generate public square announcement
export const generatePublicSquare = async (req, res) => {
  try {
    const { cityId } = req.params;
    const { cityName, theme, recentActivity } = req.body;

    // Build prompt for 2-3 sentence engaging announcement
    const prompt = `You are the town crier for ${cityName}, a ${theme}-themed city in the GeoCities AI platform. 
Recent activity: ${recentActivity || 'New visitors exploring the city'}

Write a brief, engaging 2-3 sentence announcement for the public square that captures the energy and excitement of what's happening in the city. Make it feel like a living, breathing community. Be creative and enthusiastic!`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();

    res.json({
      cityId,
      summary,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating public square:', error);
    res.status(500).json({ error: 'Failed to generate public square announcement' });
  }
};

// Generate newsletter
export const generateNewsletter = async (req, res) => {
  try {
    const { cityId } = req.params;
    const { cityName, theme, pages } = req.body;

    const pageCount = pages?.length || 0;

    // Build prompt for 3-4 paragraph newsletter covering highlights, trends, and unique characteristics
    const prompt = `You are an AI journalist writing the weekly newsletter for ${cityName}, a ${theme}-themed city in the GeoCities AI platform with ${pageCount} pages of content.

Write a creative 3-4 paragraph newsletter that covers:
1. Highlights of recent activity and new content
2. Emerging trends in the city's culture
3. Unique characteristics that make this city special

Make it engaging, informative, and capture the spirit of this ${theme}-themed community. Write in a journalistic but playful style that fits the nostalgic GeoCities vibe.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const newsletter = response.text();

    res.json({
      cityId,
      newsletter,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating newsletter:', error);
    res.status(500).json({ error: 'Failed to generate newsletter' });
  }
};

// Generate radio station description
export const generateRadio = async (req, res) => {
  try {
    const { cityId } = req.params;
    const { cityName, vibe } = req.body;

    // Build prompt for genre, mood descriptors, and 3 fictional song titles
    const prompt = `You are creating the radio station for ${cityName}, a city with a ${vibe} vibe in the GeoCities AI platform.

Describe the radio station in a creative, atmospheric way. Include:
1. The genre/style of music that plays
2. Mood descriptors that capture the station's atmosphere
3. Three fictional song titles that would play on this station (make them creative and fitting to the ${vibe} vibe)

Write it as an immersive description that makes people feel like they're tuning into this unique station. Be evocative and capture the essence of the ${vibe} atmosphere.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const radioDescription = response.text();

    res.json({
      cityId,
      radioDescription,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating radio station:', error);
    res.status(500).json({ error: 'Failed to generate radio station description' });
  }
};

export { model };


// Generate page content
export const generatePageContent = async ({ cityId, title, type, prompt }) => {
  try {
    // Import cities to get city context
    const { getCityById } = await import('./cityController.js');
    const city = getCityById(cityId);
    
    if (!city) {
      throw new Error('City not found');
    }

    // Build comprehensive prompt
    const aiPrompt = `You are creating content for a page in GeoCities AI.

City Context:
- City Name: ${city.name}
- Theme: ${city.theme}
- Vibe: ${city.vibe}

Page Details:
- Title: ${title}
- Type: ${type}
- User's Request: ${prompt}

Create engaging, creative content for this page that:
1. Matches the ${city.vibe} vibe of ${city.name}
2. Fits the ${city.theme} theme
3. Is appropriate for a ${type} page
4. Fulfills the user's request: "${prompt}"
5. Is 2-4 paragraphs long
6. Feels authentic to the GeoCities aesthetic (nostalgic, creative, personal)

Write the content now:`;

    const result = await model.generateContent(aiPrompt);
    const response = await result.response;
    const content = response.text();
    
    return content;
  } catch (error) {
    console.error('Error generating page content:', error);
    throw error;
  }
};

const { GoogleGenerativeAI } = require('@google/generative-ai');
const functions = require('firebase-functions');
const { getCachedAIGeneration, saveAIGeneration } = require('../utils/aiCache');

// Lazy initialization - don't check env vars at import time
let genAI = null;
let model = null;
let initialized = false;

function getModel() {
  if (!initialized) {
    // Get API key from Firebase Functions config
    const apiKey = functions.config().gemini?.api_key || process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('❌ GEMINI_API_KEY not configured');
      throw new Error('GEMINI_API_KEY is required. Set it with: firebase functions:config:set gemini.api_key="YOUR_KEY"');
    }

    console.log('✅ Gemini API Key loaded');

    // Initialize GoogleGenerativeAI with API key
    genAI = new GoogleGenerativeAI(apiKey);

    // Configure gemini model
    model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    initialized = true;
  }
  
  return model;
}

// Get cached AI content for a city
const getCachedContent = async (req, res) => {
  try {
    const { cityId } = req.params;
    
    const [publicSquare, newsletter, radio] = await Promise.all([
      getCachedAIGeneration(cityId, 'publicSquare'),
      getCachedAIGeneration(cityId, 'newsletter'),
      getCachedAIGeneration(cityId, 'radio')
    ]);
    
    res.json({
      publicSquare,
      newsletter,
      radio
    });
  } catch (error) {
    console.error('Error fetching cached content:', error);
    res.status(500).json({ error: 'Failed to fetch cached content' });
  }
};

// Generate public square announcement
const generatePublicSquare = async (req, res) => {
  try {
    const { cityId } = req.params;
    const { cityName, theme, recentActivity } = req.body;

    // Check for cached content first
    const cached = await getCachedAIGeneration(cityId, 'publicSquare');
    if (cached) {
      return res.json({
        cityId,
        summary: cached,
        generatedAt: new Date().toISOString(),
        cached: true
      });
    }

    // Get actual pages from Firestore to analyze
    const { getFirestore } = require('../config/firebase');
    const db = getFirestore();
    const pagesSnapshot = await db.collection('pages')
      .where('cityId', '==', cityId)
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();
    
    const pages = pagesSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        title: data.title,
        type: data.type,
        excerpt: data.content.substring(0, 150)
      };
    });

    // Build prompt based on actual content
    let prompt;
    if (pages.length === 0) {
      prompt = `You are the events coordinator for ${cityName}, a ${theme}-themed city in the GeoCities AI platform. 

The city has just been founded! Write a brief 2-3 sentence announcement about today's "grand opening" event, welcoming the first residents and describing what exciting activities and opportunities await in this new ${theme}-themed neighborhood.`;
    } else {
      const pagesSummary = pages.map(p => `- "${p.title}" (${p.type})`).join('\n');
      prompt = `You are the events coordinator for ${cityName}, a ${theme}-themed city in the GeoCities AI platform. 

Recent pages created:
${pagesSummary}

Write a brief 2-3 sentence announcement about today's events and happenings in the public square. This could include:
- Community gatherings or meetups related to recent content
- Celebrations of new pages or milestones
- Daily activities or workshops happening in the city
- Information about what's trending today

Make it feel like a real daily event announcement. Reference specific pages if relevant. Be creative and enthusiastic!`;
    }

    const result = await getModel().generateContent(prompt);
    const response = await result.response;
    const summary = response.text();

    // Save to cache
    await saveAIGeneration(cityId, 'publicSquare', summary);

    res.json({
      cityId,
      summary,
      generatedAt: new Date().toISOString(),
      cached: false
    });
  } catch (error) {
    console.error('Error generating public square:', error);
    res.status(500).json({ error: 'Failed to generate public square announcement' });
  }
};

// Generate newsletter
const generateNewsletter = async (req, res) => {
  try {
    const { cityId } = req.params;
    const { cityName, theme } = req.body;

    // Check for cached content first
    const cached = await getCachedAIGeneration(cityId, 'newsletter');
    if (cached) {
      return res.json({
        cityId,
        newsletter: cached,
        generatedAt: new Date().toISOString(),
        cached: true
      });
    }

    // Get actual pages from Firestore to analyze
    const { getFirestore } = require('../config/firebase');
    const db = getFirestore();
    const pagesSnapshot = await db.collection('pages')
      .where('cityId', '==', cityId)
      .orderBy('createdAt', 'desc')
      .limit(20)
      .get();
    
    const pages = pagesSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        title: data.title,
        type: data.type,
        content: data.content.substring(0, 300),
        createdAt: data.createdAt
      };
    });

    const pageCount = pages.length;

    // Build prompt based on actual content
    let prompt;
    if (pageCount === 0) {
      prompt = `You are an AI journalist writing today's top news for ${cityName}, a ${theme}-themed city in the GeoCities AI platform.

This is a brand new city with no pages yet! Write 3-4 short news stories (in paragraph form) covering:
1. **BREAKING:** The grand opening of ${cityName}
2. **COMMUNITY:** What kind of residents and content this ${theme}-themed neighborhood hopes to attract
3. **FORECAST:** Predictions for what exciting developments might happen soon

Write in a news-style format with a playful GeoCities twist. Make each story feel like a real news headline come to life!`;
    } else {
      const pagesSummary = pages.map(p => 
        `- **${p.title}** (${p.type}): ${p.content.substring(0, 100)}...`
      ).join('\n');
      
      prompt = `You are an AI journalist writing today's top news stories for ${cityName}, a ${theme}-themed city in the GeoCities AI platform with ${pageCount} pages of content.

Recent pages in the city:
${pagesSummary}

Write 3-4 short news stories (in paragraph form) covering today's top happenings:
1. **HEADLINE STORY:** Feature the most interesting or recent page with specific details
2. **TRENDING:** What's popular or emerging as a trend in the community
3. **COMMUNITY SPOTLIGHT:** Highlight another notable page or creator
4. **WHAT'S NEXT:** Tease what might be coming or what the city needs

Write in a news-style format. Reference specific page titles and content. Make it feel like real daily news coverage with a playful GeoCities vibe!`;
    }

    const result = await getModel().generateContent(prompt);
    const response = await result.response;
    const newsletter = response.text();

    // Save to cache
    await saveAIGeneration(cityId, 'newsletter', newsletter);

    res.json({
      cityId,
      newsletter,
      generatedAt: new Date().toISOString(),
      cached: false
    });
  } catch (error) {
    console.error('Error generating newsletter:', error);
    res.status(500).json({ error: 'Failed to generate newsletter' });
  }
};

// Generate radio station description
const generateRadio = async (req, res) => {
  try {
    const { cityId } = req.params;
    const { cityName, vibe } = req.body;

    // Check for cached content first
    const cached = await getCachedAIGeneration(cityId, 'radio');
    if (cached) {
      return res.json({
        cityId,
        radioDescription: cached,
        generatedAt: new Date().toISOString(),
        cached: true
      });
    }

    // Build prompt for genre, mood descriptors, and 3 fictional song titles
    const prompt = `You are creating the radio station for ${cityName}, a city with a ${vibe} vibe in the GeoCities AI platform.

Describe the radio station in a creative, atmospheric way. Include:
1. The genre/style of music that plays
2. Mood descriptors that capture the station's atmosphere
3. Three fictional song titles that would play on this station (make them creative and fitting to the ${vibe} vibe)

Write it as an immersive description that makes people feel like they're tuning into this unique station. Be evocative and capture the essence of the ${vibe} atmosphere.`;

    const result = await getModel().generateContent(prompt);
    const response = await result.response;
    const radioDescription = response.text();

    // Save to cache
    await saveAIGeneration(cityId, 'radio', radioDescription);

    res.json({
      cityId,
      radioDescription,
      generatedAt: new Date().toISOString(),
      cached: false
    });
  } catch (error) {
    console.error('Error generating radio station:', error);
    res.status(500).json({ error: 'Failed to generate radio station description' });
  }
};

// Generate page content
const generatePageContent = async ({ cityId, title, type, prompt }) => {
  try {
    // Import cities to get city context
    const { getCityById } = require('./cityController');
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

    const result = await getModel().generateContent(aiPrompt);
    const response = await result.response;
    const content = response.text();
    
    return content;
  } catch (error) {
    console.error('Error generating page content:', error);
    throw error;
  }
};


// Detect if content is AI-generated
const detectAIContent = async (content) => {
  try {
    const prompt = `Analyze the following text and determine if it was likely generated by an AI language model.

Consider these indicators:
1. Overly formal or structured language
2. Lack of personal anecdotes or specific details
3. Generic or templated phrasing
4. Perfect grammar and punctuation
5. Balanced, neutral tone without strong opinions
6. Repetitive sentence structures
7. Lack of colloquialisms or informal language
8. Overly comprehensive or encyclopedic style

Text to analyze:
"""
${content}
"""

Respond with ONLY a JSON object in this exact format (no other text):
{
  "isAiGenerated": true,
  "confidence": 0.85,
  "reasoning": "brief explanation"
}`;

    const result = await getModel().generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from AI detection');
    }
    
    const analysis = JSON.parse(jsonMatch[0]);
    
    // Determine tag based on confidence threshold
    const contentTag = analysis.confidence > 0.7 ? 'detected-ai' : 'user-written';
    
    console.log(`AI Detection: ${contentTag} (confidence: ${analysis.confidence})`);
    console.log(`Reasoning: ${analysis.reasoning}`);
    
    return {
      contentTag,
      aiConfidenceScore: analysis.confidence,
      reasoning: analysis.reasoning
    };
  } catch (error) {
    console.error('Error detecting AI content:', error);
    // Default to user-written on error
    return {
      contentTag: 'user-written',
      aiConfidenceScore: null,
      reasoning: 'Detection failed'
    };
  }
};


module.exports = {
  getCachedContent,
  generatePublicSquare,
  generateNewsletter,
  generateRadio,
  generatePageContent,
  detectAIContent
};

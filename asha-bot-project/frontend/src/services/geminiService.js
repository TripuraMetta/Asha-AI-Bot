import axios from 'axios';

const GEMINI_API_URL = 'https://api.google.com/gemini'; // Replace with actual endpoint (check Google docs)
const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

export const getGeminiResponse = async (message) => {
  try {
    const response = await axios.post(
      GEMINI_API_URL,
      {
        prompt: message,
        maxTokens: 100,
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.candidates[0].content; // Adjust based on actual API response structure
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return "Sorry, I couldn’t process that right now. Try again later!";
  }
};
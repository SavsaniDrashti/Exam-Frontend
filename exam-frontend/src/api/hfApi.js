import axios from "axios";

export const getGeminiResponse = async (inputText) => {
  try {
    // Ensure this matches your [Route("api/ai")] in ASP.NET
    const response = await axios.post("https://localhost:7240/api/ai", {
      inputText,
    });
    return response.data; // This will now be the Gemini JSON object
  } catch (error) {
    console.error("Error calling ASP.NET backend:", error.message);
    return null;
  }
};
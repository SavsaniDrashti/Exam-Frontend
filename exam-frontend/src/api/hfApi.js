import axios from "axios";

export const getGeminiResponse = async (inputText) => {
  try {
    // Ensure this matches your [Route("api/ai")] in ASP.NET
    const response = await axios.post("http://10.119.220.26:8084/api/ai", {
      inputText,
    });
    return response.data; // This will now be the Gemini JSON object
  } catch (error) {
    console.error("Error calling ASP.NET backend:", error.message);
    return null;
  }
};
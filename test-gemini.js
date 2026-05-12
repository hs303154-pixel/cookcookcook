import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = "AIzaSyBr4zI3z-YqzTi2z2KKkEASn5hkJpLODto";
const genAI = new GoogleGenerativeAI(apiKey);

async function test() {
  const modelsToTest = ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-flash-latest"];
  for (const modelName of modelsToTest) {
    try {
      console.log("Testing:", modelName);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("다음 JSON 형식으로 사과에 대해 출력해. { \"foodName\": \"...\" } JSON만 출력해.");
      console.log("Success with", modelName, result.response.text());
      break;
    } catch (e) {
      console.error("Failed with", modelName, e.message);
    }
  }
}
test();

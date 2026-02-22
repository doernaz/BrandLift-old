
const { GoogleGenerativeAI } = require("@google/generative-ai");

const PLACES_KEY = "AIzaSyDn69q2rhCD2IwG4GswtFGZYpyNJsVhxc4"; // From .env
const GEMINI_KEY = "AIzaSyDqeUZluj3sMOaNksaiqHCpad4zgNJguiY"; // From .env

const API_KEY = PLACES_KEY; // Trying the PLACES key this time

async function listModels() {
    const genAI = new GoogleGenerativeAI(API_KEY);
    try {
        // There isn't a direct listModels on GoogleGenerativeAI instance in some versions,
        // but let's try to infer or just try to get a model and generate content to see if it works.
        // Actually, the error message from user "Call ListModels to see the list..." suggests the API supports it.
        // In Node SDK, it might be specific.
        // Let's try to just instantiate 'gemini-1.5-flash' and run a test prompt.

        const modelsToTest = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro", "gemini-1.0-pro"];

        console.log("Testing models with API Key ending in ...", API_KEY.slice(-5));

        for (const modelName of modelsToTest) {
            console.log(`\nTesting ${modelName}...`);
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Hello?");
                const response = await result.response;
                console.log(`SUCCESS: ${modelName} responded: ${response.text().substring(0, 20)}...`);
            } catch (e) {
                console.log(`FAILED: ${modelName} - ${e.message.split('\n')[0]}`);
            }
        }

    } catch (e) {
        console.error("Global Error", e);
    }
}

listModels();

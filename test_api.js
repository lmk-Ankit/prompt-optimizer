require('dotenv').config();
const apiKey = process.env.OPENROUTER_API_KEY;
const MODELS = [
    "mistralai/mistral-small-3.1-24b-instruct:free",
    "meta-llama/llama-3.3-70b-instruct:free",
    "google/gemma-3-12b-it:free",
    "google/gemini-2.5-flash-free",
    "mistralai/mistral-small-creative"
];

async function test() {
    for (const model of MODELS) {
        console.log(`Testing model: ${model}`);
        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://prompt-optimizer.vercel.app",
                    "X-Title": "Prompt Optimizer",
                },
                body: JSON.stringify({
                    model,
                    messages: [
                        { role: "system", content: "You are a test." },
                        { role: "user", content: "Test" },
                    ],
                    max_tokens: 10,
                }),
            });
            if (!response.ok) {
                console.error(`  Error ${response.status}: ${await response.text()}`);
            } else {
                const data = await response.json();
                console.log(`  Success! Output: ${data.choices?.[0]?.message?.content}`);
            }
        } catch (e) {
            console.error(`  Exception: ${e.message}`);
        }
    }
}

test();

require('dotenv').config();
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODELS = [
    "mistralai/mistral-small-3.1-24b-instruct:free",
    "meta-llama/llama-3.3-70b-instruct:free",
    "google/gemma-3-12b-it:free",
    "google/gemini-2.5-flash-free",
    "mistralai/mistral-small-creative"
];

let out = '';
async function test() {
    for (const model of MODELS) {
        out += `Testing model: ${model}\n`;
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
                out += `  Error ${response.status}: ${await response.text()}\n`;
            } else {
                const data = await response.json();
                out += `  Success! Output: ${data.choices?.[0]?.message?.content}\n`;
            }
        } catch (e) {
            out += `  Exception: ${e.message}\n`;
        }
    }
    fs.writeFileSync('output.txt', out, 'utf-8');
}

test();

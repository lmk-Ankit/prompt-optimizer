# ✦ Prompt Optimizer

> Transform vague prompts into precise, structured instructions that AI actually understands.

![Prompt Optimizer](https://img.shields.io/badge/status-live-10B981?style=flat-square)
![Built with](https://img.shields.io/badge/built%20with-OpenRouter-6366f1?style=flat-square)
![Deployed on](https://img.shields.io/badge/deployed%20on-Vercel-000000?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-f59e0b?style=flat-square)

---
<img width="1642" height="1322" alt="image" src="https://github.com/user-attachments/assets/ede2b0a4-a1a2-412a-b92d-6a475c75d048" />

## What it does

Prompt Optimizer takes a weak or vague prompt and rewrites it into a well-structured, role-assigned, format-specified instruction. It also scores your prompt before and after on five dimensions, so you can see exactly what improved.

**Example**

| Before | After |
|--------|-------|
| `explain neural networks` | *You are an AI tutor. Explain neural networks clearly for beginners. Include: definition, architecture, training process, real-world applications. Use analogies and bullet points.* |

---

## Features

- **Three optimization modes** — Quick Fix, Deep Elaborate, Research Style
- **Before / after scoring** — rated out of 10 across length, role, clarity, structure, and specificity
- **Issues detection** — tells you exactly what was wrong with the original prompt
- **Markdown rendering** — output renders bold, headers, and bullet lists properly
- **Dark / light mode** — persists across sessions
- **Copy to clipboard** — one click
- **Fully public** — deployed on Vercel, no login required

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla HTML/CSS/JS — single file |
| Backend | Vercel Serverless Functions (Node.js) |
| AI Model | OpenRouter API (Mistral 7B / LLaMA 3) |
| Deployment | Vercel (free tier) |
| Fonts | Playfair Display, IBM Plex Mono, Instrument Sans |

---

## Project Structure

```
prompt-optimizer/
│
├── api/
│   └── optimize.js        ← serverless backend function
│
├── static/
│   └── index.html         ← entire frontend (one file)
│
├── notebook.ipynb         ← ML pipeline + evaluation report
├── vercel.json            ← routing config
├── .env.example           ← environment variable template
├── package.json
└── README.md
```

---

## Local Development

**1. Clone the repo**
```bash
git clone https://github.com/lmk-Ankit/prompt-optimizer.git
cd prompt-optimizer
```

**2. Set up environment**
```bash
cp .env.example .env
# Open .env and add your OpenRouter API key
```

**3. Install and run**
```bash
npm install
npm run dev
# → http://localhost:3000
```

---

## Deploy Your Own

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Fork this repository
2. Go to [vercel.com](https://vercel.com) → Import repo
3. Add environment variable: `OPENROUTER_API_KEY` = your key from [openrouter.ai/keys](https://openrouter.ai/keys)
4. Click Deploy

Done — your own instance is live in under 2 minutes.

---

## ML Pipeline (Jupyter Notebook)

The `notebook.ipynb` contains the full research pipeline:

- Dataset generation via OpenRouter API
- Data cleaning, tokenization, train/test split
- FLAN-T5 fine-tuning pipeline
- Evaluation: ROUGE score, BLEU score, semantic similarity
- Before/after output comparison report

Run it locally in VS Code with the Jupyter extension.

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `OPENROUTER_API_KEY` | Your API key from openrouter.ai |
| `OPENROUTER_MODEL` | Model to use (default: `mistralai/mistral-7b-instruct`) |

---

## Roadmap

- [ ] Prompt history (save past optimizations)
- [ ] Export as PDF report
- [ ] API rate limiting + auth
- [ ] Mobile app (PWA)
- [ ] Batch optimization (multiple prompts at once)

---
<img width="1630" height="1327" alt="image" src="https://github.com/user-attachments/assets/3d86076d-9881-4571-bc46-e7e0172e78a9" />

## License

MIT — free to use, modify, and deploy.

---

<div align="center">
  <sub>Built with OpenRouter · Deployed on Vercel</sub>
</div>


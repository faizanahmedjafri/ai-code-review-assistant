# AI Code Review Assistant - Local AI

A browser-based code review tool that runs AI locally with **no external API keys** and **no paid services**. Users paste code, click **Review Code**, and receive a structured review with quality, bug, security, and performance insights.

## Project Description

This project provides a lightweight developer UI for quick, AI-assisted code analysis in the browser:

- Large code input area
- One-click review action
- Structured output panel with four review categories
- Loading spinner while model inference is running
- Responsive developer-themed dark interface

## Local AI Model (How It Works)

The app uses [transformers.js](https://github.com/xenova/transformers.js) to run a CodeBERT-family model directly in the browser:

- Model: `Xenova/codebert-base`
- Runtime: client-side JavaScript (WebAssembly/WebGPU depending on browser support)
- No backend server required
- No API keys required

The analysis combines:

1. Rule-based code heuristics (static pattern checks)
2. Local embedding similarity from CodeBERT to estimate category-level model signals

## Project Structure

```text
ai-code-review-assistant-local
│
├── index.html
├── style.css
├── script.js
└── README.md
```

## How to Run

1. Open PowerShell in the project folder.
2. Start a local static server:
   `python -m http.server 5500`
3. Open `http://localhost:5500` in a modern browser.
4. Paste code in the textarea.
5. Click **Review Code**.

Note: On first run, the model downloads to the browser cache. Subsequent runs are faster.
Note: Opening via `file://` may block model downloads in some browsers.

## Screenshots

Add screenshots here after running the app:

- `screenshots/home.png` - Main interface
- `screenshots/review-result.png` - Example analysis output

## Tech Stack

- HTML
- CSS
- JavaScript
- transformers.js
- CodeBERT model (browser-local)

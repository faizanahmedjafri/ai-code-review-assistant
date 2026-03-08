# AI Code Review Assistant

🚀 A browser-based **AI-assisted code review tool** that analyzes source code and provides suggestions for **code quality, bugs, security risks, and performance improvements** — all running **locally in the browser with no external API keys**.

The application uses a local transformer model to perform analysis directly in the client, meaning **no backend server, no cloud APIs, and no paid services are required**.

---

## 🌐 Live Demo

Deployed with GitHub Pages:

```
https://faizanahmedjafri.github.io/ai-code-review-assistant
```

---

## ✨ Features

• Paste any code snippet and instantly receive a review
• Detects potential **security issues** such as hardcoded credentials
• Identifies **code quality problems** and improvement areas
• Suggests **performance optimizations**
• Provides **refactoring guidance**
• Runs **fully in the browser** without a backend
• No API keys or external services required
• Developer-friendly **dark theme UI**

---

## 🧠 Local AI Model

The application runs AI directly in the browser using:

* **transformers.js**
* **CodeBERT-family model**
* Client-side inference

Model used:

```
Xenova/codebert-base
```

Key characteristics:

• No cloud inference
• No API key required
• Runs using WebAssembly / WebGPU depending on browser support
• Model downloads once and is cached locally in the browser

---

## ⚙️ How the Analysis Works

The review output is generated using a combination of:

### 1️⃣ Static Heuristic Analysis

Rule-based checks detect common software engineering issues such as:

* Hardcoded credentials
* Poor naming conventions
* Missing error handling
* Large functions
* Potential security patterns

### 2️⃣ Local Transformer Signals

CodeBERT embeddings are used to estimate semantic relationships and help guide the review categories.

---

## 🖥 Interface Overview

The interface provides:

• Large code input editor
• One-click **Review Code** button
• Loading indicator during analysis
• Structured review output panel

Review categories include:

* Code Quality
* Potential Bugs
* Security Concerns
* Performance Improvements

---

## 📂 Project Structure

```
ai-code-review-assistant-local
│
├── index.html
├── style.css
├── script.js
└── README.md
```

---

## ▶️ Run Locally

1️⃣ Open a terminal in the project folder

2️⃣ Start a local server

```
python -m http.server 5500
```

3️⃣ Open the application

```
http://localhost:5500
```

4️⃣ Paste your code and click **Review Code**

Note:

The AI model downloads during the first run and is stored in the browser cache. Subsequent runs are faster.

Opening the file directly using `file://` may block model downloads in some browsers.

---

## 🛠 Tech Stack

* HTML
* CSS
* JavaScript
* transformers.js
* CodeBERT (local inference)

---

## 📸 Screenshots

Add screenshots after running the project:

```
screenshots/home.png
screenshots/review-result.png
```

---

## 🎯 Project Purpose

This project demonstrates how **AI-assisted developer tooling** can run entirely on the client side without relying on cloud AI services.

It showcases how modern browser capabilities enable **lightweight AI developer tools** that are easy to deploy and accessible to anyone.

---

## 📜 License

MIT License


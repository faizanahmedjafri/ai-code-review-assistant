import { pipeline, env } from "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2";

const reviewBtn = document.getElementById("reviewBtn");
const codeInput = document.getElementById("codeInput");
const output = document.getElementById("output");
const spinner = document.getElementById("spinner");

let extractor = null;

// Browser settings for loading open-source models from Hugging Face.
env.allowRemoteModels = true;
env.allowLocalModels = false;
env.useBrowserCache = true;
env.remoteHost = "https://huggingface.co/";
env.remotePathTemplate = "{model}/resolve/{revision}/";

const MODEL_CANDIDATES = [
  "Xenova/codebert-base",
  "Xenova/all-MiniLM-L6-v2"
];

const categoryPrototypes = {
  quality: "clean readable maintainable code with descriptive names and clear structure",
  bugs: "code with risky logic edge cases null checks and off by one errors",
  security: "code vulnerable to injection unsafe eval weak validation and exposed secrets",
  performance: "efficient code with optimized loops memory use and minimal redundant work"
};

reviewBtn.addEventListener("click", async () => {
  const code = codeInput.value.trim();

  if (!code) {
    renderError("Paste code first, then click Review Code.");
    return;
  }

  setLoading(true);
  try {
    // Load the model lazily so the first page paint is fast.
    if (!extractor) {
      extractor = await loadExtractor();
    }

    const heuristicReview = runHeuristics(code);
    const aiSignals = await buildAISignals(code);
    renderReview(heuristicReview, aiSignals);
  } catch (error) {
    const message = error?.message || "Unknown model loading error.";
    const accessIssue = /Unauthorized access to file|Failed to fetch|NetworkError/i.test(message);
    if (accessIssue) {
      renderError(
        `AI analysis failed: ${message}\n\nRun via local server (http://localhost), disable strict blockers/VPN for huggingface.co, then retry.`
      );
    } else {
      renderError(`AI analysis failed: ${message}`);
    }
  } finally {
    setLoading(false);
  }
});

function setLoading(isLoading) {
  reviewBtn.disabled = isLoading;
  reviewBtn.textContent = isLoading ? "Reviewing..." : "Review Code";
  spinner.classList.toggle("hidden", !isLoading);
}

async function loadExtractor() {
  let lastError = null;

  for (const modelName of MODEL_CANDIDATES) {
    try {
      return await pipeline("feature-extraction", modelName);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error("Failed to load local AI model.");
}

async function buildAISignals(code) {
  const codeEmbedding = await getTextEmbedding(code.slice(0, 2000));
  const scores = {};

  for (const [category, prompt] of Object.entries(categoryPrototypes)) {
    const promptEmbedding = await getTextEmbedding(prompt);
    scores[category] = cosineSimilarity(codeEmbedding, promptEmbedding);
  }

  return scores;
}

async function getTextEmbedding(text) {
  const result = await extractor(text, {
    pooling: "mean",
    normalize: true
  });

  return Array.from(result.data);
}

function cosineSimilarity(a, b) {
  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }

  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

function runHeuristics(code) {
  const lines = code.split("\n");
  const review = {
    quality: [],
    bugs: [],
    security: [],
    performance: []
  };

  if (lines.length > 250) {
    review.quality.push("Large snippet detected. Consider splitting into smaller modules/functions.");
  }
  if (/function\s+[a-zA-Z0-9_]{1,2}\s*\(/.test(code)) {
    review.quality.push("Very short function names found. Use descriptive names for readability.");
  }
  if (/console\.log\(/.test(code)) {
    review.quality.push("Debug logging appears in code. Remove or gate logs for production.");
  }

  if (/==[^=]/.test(code)) {
    review.bugs.push("Loose equality (`==`) detected. Prefer strict equality (`===`) to avoid coercion bugs.");
  }
  if (/for\s*\(.+;.+<=\s*.+length/.test(code)) {
    review.bugs.push("Potential off-by-one loop boundary using `<= length`.");
  }
  if (/catch\s*\([^)]*\)\s*\{\s*\}/.test(code)) {
    review.bugs.push("Empty catch block found. Handle or report exceptions.");
  }

  if (/eval\s*\(/.test(code)) {
    review.security.push("Use of `eval` detected. This can enable code injection.");
  }
  if (/innerHTML\s*=/.test(code)) {
    review.security.push("Direct `innerHTML` assignment found. Sanitize untrusted content before rendering.");
  }
  if (/api[_-]?key|secret|token/i.test(code)) {
    review.security.push("Potential secret-like variable names found. Avoid exposing credentials in client code.");
  }

  if (/for\s*\(.+\)\s*\{[\s\S]*for\s*\(/.test(code)) {
    review.performance.push("Nested loops detected. Verify complexity for large inputs.");
  }
  if (/JSON\.parse\(JSON\.stringify\(/.test(code)) {
    review.performance.push("Deep cloning via JSON parse/stringify may be expensive for large objects.");
  }
  if (/setInterval\s*\([^,]+,\s*0\s*\)/.test(code)) {
    review.performance.push("`setInterval` with 0ms delay can cause unnecessary CPU pressure.");
  }

  fillDefaults(review);
  return review;
}

function fillDefaults(review) {
  if (!review.quality.length) {
    review.quality.push("Structure looks reasonable; add comments/tests around complex logic if needed.");
  }
  if (!review.bugs.length) {
    review.bugs.push("No obvious bug pattern matched in this quick pass.");
  }
  if (!review.security.length) {
    review.security.push("No immediate high-risk security pattern matched in this snippet.");
  }
  if (!review.performance.length) {
    review.performance.push("No clear hot-spot pattern matched; profile if this runs frequently.");
  }
}

function renderReview(review, aiSignals) {
  const content = [
    formatSection("1) Code quality observations", review.quality, aiSignals.quality),
    formatSection("2) Possible bugs", review.bugs, aiSignals.bugs),
    formatSection("3) Security concerns", review.security, aiSignals.security),
    formatSection("4) Performance suggestions", review.performance, aiSignals.performance)
  ].join("\n\n");

  output.textContent = content;
}

function formatSection(title, items, confidence) {
  const score = Number.isFinite(confidence) ? Math.max(0, Math.min(1, (confidence + 1) / 2)) : 0;
  const label = score > 0.72 ? "High" : score > 0.58 ? "Medium" : "Low";
  const lines = items.map((item) => `- ${item}`).join("\n");
  return `${title}\nModel signal: ${label} (${score.toFixed(2)})\n${lines}`;
}

function renderError(message) {
  output.innerHTML = `<p class="error">${escapeHtml(message)}</p>`;
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

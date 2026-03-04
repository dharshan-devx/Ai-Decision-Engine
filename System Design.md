# System Design Document (SDD)

This document elaborates on the deep technical architecture decisions, resilience mechanisms, edge case handling, and core module designs for the AI Decision Engine project.

---

## 1. Introduction

The AI Decision Engine acts as a structured reasoning synthesizer. It converts highly unstructured human dilemmas (with implicit assumptions and biases) into structured, mathematically weighted JSON data models, and then renders those models into a premium data-visualization suite. 

The primary challenge of this system is **determinism via a non-deterministic platform (LLMs).** 

This document defines the strategies adopted to maintain reliability, integrity, and strict JSON enforcement.

---

## 2. Multi-Agent Reasoning Architecture

Instead of relying on a single mega-prompt (which dilutes perspective), the engine uses a 3-Agent architecture built around a **Debate-then-Synthesize** pattern:

1. **Agent A (Visionary Optimist):** Instructed to find the path of maximum upside, optionality, and agency. It ignores traditional constraints to search for exponential outcomes.
2. **Agent B (Pragmatic Risk Manager):** Instructed to find fragility, hidden ruin risks, and worst-case scenarios. It actively tries to kill bad ideas.
3. **Agent C (Synthesizer/Arbitrator):** Takes the raw outputs of Agents A & B and synthesizes them against the user's constraints (Age, Risk Profile, Time Horizon) into the final 11-dimension JSON.

*Implementation Mechanism:* Agents A and B execute concurrently via `asyncio.gather()` to maximize speed, cutting analysis load times nearly in half.

---

## 3. Resilience and Fault Tolerance

Handling large language models in a highly concurrent REST API environment mandates multiple layers of fault protection.

### 3.1 The Custom Stack Parser (JSON Integrity Strategy)

**The Problem Boundary: LLM Output Truncation**
When requesting bounded output, Gemini generally returns valid JSON. However, if the output window token limit is breached (which frequently happens on complex dilemmas), the LLM stops abruptly. A trailing `}, {"x": "y"]` structure crashes standard `json.loads()`.

**The Solution: Mathematical Stack Reconstruction**
The backend implements a multi-pass text-parsing algorithm `repair_json()` designed to patch broken JSON mathematically:

1. **Phase 1 (Validation):** If `json.loads()` passes, execution continues.
2. **Phase 2 (Trimming):** The parser walks backward to find the nearest closing character (`}`, `]`, or `"`).
3. **Phase 3 (Stack Matching):** The algorithm iterates string-by-string while computing unmatched quotes. It tracks `{` and `[` braces.
4. **Phase 4 (Reconstruction):** It forces the string closed by appending the necessary unbalanced braces in reverse order.
5. **Phase 5 (Sanitization):** It identifies trailing commas hanging before a closing bracket and removes them.

*The Result: The frontend will always receive a valid `AnalyzeResponse` object, preventing hard UI crashes.*

### 3.2 Thread-Isolated Playwright Execution

**The Problem Boundary: Asynchronous GUI Operations**
Generating a high-fidelity PDF from HTML demands a headless browser. Playwright's async API, when mixed with Python's FastApi Event Loop on standard environments (Windows `ProactorEventLoop`), suffers from `IOError: Closed Pipe` race conditions resulting in fatal event loop crashes.

**The Solution: Thread Pool Offloading**
The system abandons `async_playwright()`. Instead:
1. Playwright uses synchronous bindings (`sync_playwright()`).
2. Execution is routed completely out of the FastAPI event loop via `asyncio.to_thread()`.
3. The function provisions its own local thread context, executes the render, writes the binary stream, and kills the browser.
4. An `asyncio.Lock()` is placed around the thread-dispatch to prevent dozens of concurrent Chromium engines from spinning up and OOM-killing the container.

*The Result: True concurrency without event loop poisoning.*

---

## 4. Rate Limiting Strategy (Economic Defense)

As the Gemini API key is embedded on the backend, public exposure introduces financial risk and quota exhaustion.

**The Strategy: Token Bucket Algorithm**
- A backend state wrapper (`RateLimiter`) tracks requests per minute (RPM) per client IP.
- The default limit is configured strictly to enforce free-tier Gemini API limitations (10 requests per 60 seconds).
- A specialized export limit enforces a 10-second cooldown per IP for PDF generation.

**The Escape Hatch: Bring Your Own Key (BYOK)**
The UI offers users an advanced configuration menu to input their own generic API key. If the `api_key` payload is present:
1. The global rate limiter is instantly bypassed.
2. The UI unlocks "High-Precision Mode."
3. The user assumes the quotas tied to their respective Google GCP account.

**Event-Driven Health Check: The AIStatusManager**
Instead of pinging the LLM API every 30 seconds (which wastes quota), the backend passively tracks health via `AIStatusManager`. Incoming `/analyze` requests report either `success` or `error`. If it detects a HTTP 429 quota exhaustion, it shifts the global status to `quota_exceeded` and broadcasts this down to the frontend header UI.

*The Result: A scalable free tier combined with unrestricted usage for advanced users.*

---

## 5. Frontend Render Patterns

The React architecture is deeply segmented. The primary component (`Results`) must render 11 distinct widgets dynamically based on complex incoming JSON properties.

### 5.1 "Glassmorphism" Design Strategy
Rather than using CSS-in-JS (Styled Components) or utility classes (Tailwind), the project uses a pure, semantic CSS file. 

The aesthetic is achieved using token variables mapped to `--bg` themes:
- `backdrop-filter: blur(16px)` layered gradients.
- Micro-animations utilizing custom Bezier curves (`cubic-bezier(0.4, 0, 0.2, 1)`).
- Strict separation of semantic markup from style logic.

### 5.2 Handling Zero Layout Shift (CLS Mitigation)
The UI incorporates help tooltips on almost every data point. Standard CSS absolute positioning creates a browser recalculation when tooltips extend beyond screen width, causing scrollbar flickering.

**The Solution:**
A `HelpIcon.js` component dynamically binds to a `useRef` to measure the viewport bounding box prior to the CSS transition state switching to `opacity: 1`, ensuring the absolute coordinates recalculate inwards instead of outwards.

### 5.3 Data Visualization Engines
- `Recharts`: Used for mathematical polygon generation (Radar charts) for Risk Analysis and Skill Deltas.
- `jsPDF`: Used directly on the client to export highly-structured, paginated PDF reports without hitting the backend chromium server. 
- `React Flow`: Provides panning, zooming, and automated node-placement for the multi-branch Decision Tree.

---

## 6. Security Posture

1. **Proxy Gating:** The `ALLOWED_ORIGINS` policy explicitly drops connections not fired from the Vercel domain, acting as a lightweight proxy gate.
2. **Ephemeral Document Processing:** PDFs/TXT files uploaded for context extraction are processed directly in-memory and immediately discarded. No temp files reside on the disk.
3. **Anonymous Metrics:** Visitor analytics track via client-generated UUIDs stored harmlessly in `localStorage`. No IP tracking, no cookies, no personal identity logging.

---

## 7. Summary

This design guarantees high-fidelity, deterministic performance against external non-deterministic AI platforms. It optimizes for visual presentation, system reliability, financial scalability, and high-performance server concurrency.

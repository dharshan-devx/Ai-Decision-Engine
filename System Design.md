# System Design Document (SDD)

This document elaborates on the deep technical architecture decisions, resilience mechanisms, edge case handling, and core module designs for the AI Decision Engine project.

---

## 1. Introduction

The AI Decision Engine acts as a structured reasoning synthesizer. It converts highly unstructured human dilemmas (with implicit assumptions and biases) into structured, mathematically weighted JSON data models, and then renders those models into a premium data-visualization suite. 

The primary challenge of this system is **determinism via a non-deterministic platform (LLMs).** 

This document defines the strategies adopted to maintain reliability and integrity.

---

## 2. Resilience and Fault Tolerance

Handling large language models in a highly concurrent REST API environment mandates multiple layers of fault protection.

### 2.1 The Custom Stack Parser (JSON Integrity Strategy)

**The Problem Boundary: LLM Output Truncation**
When requesting `response_mime_type="application/json"`, Gemini (and other frontier models) generally output valid JSON. However, if the output window token limit is breached, the LLM stops abruptly. A trailing `}, {"x": "y"]` structure crashes standard `json.loads()`.

**The Solution: Mathematical Stack Reconstruction**
The backend implements a multi-pass text-parsing algorithm `fix_incomplete_json()` designed to patch broken JSON mathematically:

1. **Phase 1 (Validation):** If `json.loads()` passes, execution continues.
2. **Phase 2 (Trimming):** The parser walks backward to find the nearest closing character (`}`, `]`, or `"`).
3. **Phase 3 (Stack Matching):** The algorithm iterates line-by-line while maintaining a `stack` array. Every time it encounters `{` or `[`, it pushes it. Every time it encounters `}` or `]`, it pops it.
4. **Phase 4 (Reconstruction):** It identifies the remainder of the unbalanced stack and appends the inverse brackets in reverse order.
5. **Phase 5 (Sanitization):** It identifies trailing commas hanging before a closing bracket and removes them via regex.

*The Result: The frontend will always receive a valid `AnalysisResponse` object even if the AI stops generating halfway through a paragraph.*

### 2.2 Thread-Isolated Playwright Execution

**The Problem Boundary: Asynchronous GUI Operations**
Generating a high-fidelity PDF from HTML demands a headless browser. Playwright's async API, when mixed with Python's FastApi Event Loop on standard environments (Windows `ProactorEventLoop`), suffers from `IOError: Closed Pipe` race conditions resulting in fatal event loop crash.

**The Solution: Thread Pool Offloading**
The system abandons `async_playwright()`. Instead:
1. Playwright uses synchronous bindings (`sync_playwright()`).
2. Execution is routed completely out of the FastAPI event loop via `asyncio.to_thread()`.
3. The function provisions its own local event loop and browser context, executes the render, writes the binary stream, and kills the browser context *before* returning execution flow back to FastAPI.

*The Result: True concurrency without event loop poisoning. 50 parallel PDF requests will lock the thread pool but won't crash the server.*

---

## 3. Rate Limiting Strategy (Economic Defense)

As the Gemini API key is embedded on the backend, public exposure introduces financial risk.

**The Strategy: Token Bucket Algorithm**
- A backend state wrapper tracks requests per minute (RPM) and requests per day (RPD) per client IP.
- The default limit is configured strictly to enforce free-tier Gemini API limitations (15 requests per minute, 1500 per day).

**The Escape Hatch: Bring Your Own Key (BYOK)**
The UI offers users an advanced configuration menu to input their own generic API key. If the `api_key` payload is present:
1. The global rate limiter is instantly bypassed.
2. The user assumes the quotas tied to their respective Google GCP project.

*The Result: A scalable free tier combined with unrestricted enterprise usage for advanced users.*

---

## 4. Frontend Render Patterns

The React architecture is deeply segmented. The primary component (`Content`) must render 11 distinct widgets dynamically based on complex incoming JSON properties.

### 4.1 "Glassmorphism" Design Strategy
Rather than using CSS-in-JS (Styled Components) or utility classes (Tailwind), the project uses a pure, semantic CSS file. 

The aesthetic is achieved using token variables mapped to the `.dark` class:
- `backdrop-filter: blur(16px)`
- Subtle multi-layered linear gradients.
- Micro-animations and hover transitions utilizing custom Bezier curves (`cubic-bezier(0.4, 0, 0.2, 1)`).

### 4.2 Handling Zero Layout Shift (CLS Mitigation)
The UI incorporates tooltips on almost every data point. Standard web absolute positioning creates a browser recalculation when tooltips extend beyond screen width, causing scrollbar flickering.

**The Solution:**
A `HelpIcon.js` component dynamically binds to a `useRef` to measure the viewport bounding box prior to the CSS transition state switching to `opacity: 1`, ensuring the absolute coordinates recalculate inwards instead of outwards, preventing horizontal scroll generation.

---

## 5. Security Posture

1. **No Backend Authentication:** The `ALLOWED_ORIGINS` policy explicitly drops connections not fired from the Vercel domain, acting as a lightweight proxy gate.
2. **Ephemeral Document Processing:** PDFs/TXT files uploaded for context extraction are processed directly in-memory and immediately discarded. No temp files reside on the Render internal disk.

---

## 6. Summary

This design guarantees high-fidelity, deterministic performance against external non-deterministic integrations. It optimizes for visual presentation, system reliability, and economic scalability.

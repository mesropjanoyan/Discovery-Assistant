# 🧭 Discovery Assistant

Discovery Assistant is an AI-powered digital product discovery assistant designed to help facilitators plan, execute, and synthesize high-impact workshops.

**Live Demo** (work in progress): <a href="https://discovery-assistant-cyan.vercel.app" target="_blank">Discovery Assistant live on Vercel</a>

## About The Project

This project is designed to cut down the busywork and cognitive load associated with planning and running effective product discovery sessions. It's built on the principle that a great workshop, like a film, has three distinct phases:

1.  **Pre-Facilitation (Planning):** What's our goal? What's the problem? Who needs to be there?
2.  **Facilitation (Execution):** How do we run the session effectively?
3.  **Post-Facilitation (Synthesis):** What did we learn? What are our next steps?

Discovery Assistant aims to provide a generative AI-powered tool to assist facilitators through all three phases, starting with the most critical: the **planning** phase.

---

## 💻 Current Status: Sprint 1 (The Core Diagnostic Tool)

The current version is a **client-side-only diagnostic tool** that helps facilitators identify exactly where their team is stuck in the discovery process.

It guides the facilitator through the 7 steps of product discovery. When a user clicks "No" on a step (e.g., "Agreeing On Goals"), the application uses client-side JavaScript to filter a local `activities.json` file and instantly recommends tactics tagged with the "Goals" step.

This achieves the core goal—getting the right workshop to the facilitator—with zero backend complexity, API calls, or cost.

### The 7 Steps of Discovery

1.  **🧭 Agreeing On Goals:** Do we know clearly what our team is working towards?
2.  **🧠 Understanding The Problem:** Do we know the biggest problem we are solving?
3.  **🖼 Framing The Problem:** Are we able to clearly articulate the problem we are solving?
4.  **💡 Generating Ideas:** Do we have a range of ideas on how to solve the problem?
5.  **⚖️ Evaluating Solutions:** Have we assessed if our ideas are robust and viable?
6.  **📌 Prioritizing What To Test:** Have we decided which ideas to test?
7.  **🦺 Testing A Prototype:** Have we tested our prototype?

---

## 🛠️ Technology Stack

This project prioritizes speed, feasibility, and low cost. The stack is intentionally "lean" and avoids heavy frameworks and build steps.

* **Frontend:** Semantic HTML5, Vanilla CSS3 (Flexbox/Grid), Vanilla JavaScript (ES6+).
* **Backend:** Vercel (Hobby Plan) for hosting. Vercel Serverless Functions (Node.js) will be used for all secure backend API calls.
* **AI & Data:**
    * **Google AI Studio (Gemini Pro):** The generative AI engine for future smart features.
    * **Local JSON:** `activities.json` and `steps.json` act as the fast, free "database" for the core diagnostic tool.
* **Tooling:** Visual Studio Code, GitHub, and GitHub Copilot Pro.

---

## 🚀 Project Roadmap

This project is being built in three distinct, iterative sprints.

### Sprint 1: The Core Diagnostic Tool (Client-Side Only)

* **Goal:** Build the complete 7-step diagnostic flow using only HTML, CSS, and client-side JavaScript.
* **Status:** ✅ **Complete**

### Sprint 2: The AI "Plumbing" (Backend Hook)

* **Goal:** Build and deploy a Vercel Serverless Function (in the `/api` folder) to securely call the Google Gemini API. This is the critical step to move the API key off the client and onto a secure server environment.
* **Status:** 🏃 **In Progress**

### Sprint 3: The "Smart" AI Feature (Synthesis)

* **Goal:** Integrate the Gemini API to provide true value-add *synthesis*, moving beyond the simple filtering of Sprint 1.
* **Proposed Feature:** Add a **"Help me plan this session"** button. This will send the user's context (e.g., "I have 90 minutes, 5 participants") along with the JSON data for the recommended workshops to the AI. The AI will then read the workshop instructions and the user's context to generate a custom-tailored agenda.
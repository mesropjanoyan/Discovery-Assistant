# 🧭 Discovery Assistant

Discovery Assistant is an AI-powered digital product discovery assistant designed to help facilitators plan, execute, and synthesize high-impact workshops.

## About The Project

This project is designed to cut down the "busywork" and cognitive load associated with planning and running effective product discovery sessions. It's built on the principle that a great workshop, like a film, has three distinct phases:

1.  **Pre-Facilitation (Planning):** What's our goal? What's the problem? Who needs to be there?
2.  **Facilitation (Execution):** How do we run the session effectively?
3.  **Post-Facilitation (Synthesis):** What did we learn? What are our next steps?

Discovery Assistant aims to provide a generative AI-powered tool to assist facilitators through all three phases, starting with the most critical: the **planning** phase.

## MVP (Current Version)

The current Minimum Viable Product (MVP) is a **diagnostic tool** that helps facilitators identify exactly where their team is stuck in the discovery process.

It guides the facilitator through the 7 steps of product discovery. By answering a series of "Yes/No" questions, the facilitator can pinpoint the exact problem they need to solve. When a "No" is encountered, the app provides a curated list of proven workshop tactics designed to solve that specific problem.

### The 7 Steps of Discovery

This tool is based on the following 7-step methodology:

1.  **🧭 Agreeing On Goals:** Do we know clearly what our team is working towards?
2.  **🧠 Understanding The Problem:** Do we know the biggest problem we are solving?
3.  **🖼 Framing The Problem:** Are we able to clearly articulate the problem we are solving?
4.  **💡 Generating Ideas:** Do we have a range of ideas on how to solve the problem?
5.  **⚖️ Evaluating Solutions:** Have we assessed if our ideas are robust and viable?
6.  **📌 Prioritizing What To Test:** Have we decided which ideas to test?
7.  **🦺 Testing A Prototype:** Have we tested our prototype?

---

## Technology Stack

This project prioritizes speed, feasibility, and low cost. The stack is intentionally "lean" and avoids heavy frameworks and build steps.

* **Frontend:** Semantic HTML5, Vanilla CSS3 (Flexbox/Grid), Vanilla JavaScript (ES6+).
* **Data:** `workshops.json` (a flat-file "database" of curated workshop tactics).
* **Hosting:** Vercel (Hobby Plan).
* **Development:** Visual Studio Code, GitHub, and GitHub Copilot Pro.

---

## Future Roadmap (Phase 2)

The MVP establishes the core logic. The next phase will focus on integrating generative AI to make the assistant truly "smart."

* **Generative AI Integration:** Connect to the Google Gemini Pro API to provide dynamic suggestions, help draft workshop plans, and synthesize notes.
* **Secure API Calls:** Build Vercel Serverless Functions (Node.js) to securely handle all API calls to the AI.
* **Feature Expansion:**
    * **Agenda Builder:** An AI-powered tool to generate a complete workshop agenda based on goals and participant count.
    * **Synthesis Assistant:** An interface to paste raw workshop notes (e.g., from a digital whiteboard) and have the AI synthesize them into key themes, action items, and a summary.
    * **Facilitation Tools:** Add features to support the *Execution* phase, such as timers, prompts, and instructions.

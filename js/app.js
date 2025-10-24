// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. STATE MANAGEMENT ---
    // We'll store all our data and app state in these variables
    let allSteps = [];
    let allActivities = [];
    let currentStepIndex = 0;
    let userPlan = []; // To store answers for the export feature
    let lastRecommendedActivities = []; // To store recommended activities for export

    // --- 2. DOM ELEMENT SELECTION ---
    // Get references to all the interactive elements on the page
    const stepCard = document.getElementById('step-card');
    const stepEmoji = document.getElementById('step-emoji');
    const stepTitle = document.getElementById('step-title');
    const stepQuestion = document.getElementById('step-question');
    const stepAnswer = document.getElementById('step-answer');
    const confidenceScale = document.getElementById('confidence-scale');
    
    const btnNo = document.getElementById('btn-no');
    const btnSubmit = document.getElementById('btn-submit');
    const btnRestart = document.getElementById('btn-restart');
    const btnExport = document.getElementById('btn-export');
    
    const diagnosticTool = document.getElementById('diagnostic-tool');
    const resultsSection = document.getElementById('results');
    const resultsList = document.getElementById('results-list');
    const summaryList = document.getElementById('summary-list');

    // --- 3. CORE FUNCTIONS ---

    /**
     * Kicks off the entire application.
     * Fetches data and displays the first step.
     */
    async function initializeApp() {
        try {
            // Use Promise.all to fetch both files at the same time
            const [stepsResponse, activitiesResponse] = await Promise.all([
                fetch('data/steps.json'),
                fetch('data/activities.json')
            ]);
            
            allSteps = await stepsResponse.json();
            allActivities = await activitiesResponse.json();
            
            // Now that data is loaded, display the first step
            displayStep(currentStepIndex);

        } catch (error) {
            console.error("Error loading data:", error);
            stepTitle.textContent = "Error";
            stepQuestion.textContent = "Could not load diagnostic data. Please refresh the page.";
        }
    }

    /**
     * Displays a specific step in the UI based on the index.
     * @param {number} index - The index of the step to display from allSteps
     */
    function displayStep(index) {
        if (index < allSteps.length) {
            const step = allSteps[index];
            stepEmoji.textContent = step.emoji;
            stepTitle.textContent = step.title;
            stepQuestion.textContent = step.question;
            
            // Reset form fields for the new step
            stepAnswer.value = '';
            // Deselect all radio buttons
            document.querySelectorAll('input[name="confidence"]').forEach(radio => radio.checked = false);
        } else {
            // User has completed all steps confidently
            showFinalSummary();
        }
    }

    /**
     * Gathers user input, checks confidence, and moves to the next step
     * or shows the results.
     */
    function handleSubmit() {
        const answer = stepAnswer.value.trim();
        const confidenceRadio = document.querySelector('input[name="confidence"]:checked');
        const confidence = confidenceRadio ? parseInt(confidenceRadio.value) : 0;
        
        const currentStep = allSteps[currentStepIndex];
        
        // Check logic: answer exists AND confidence >= 3
        if (answer && confidence >= 3) {
            // User is confident - add to plan and continue
            userPlan.push({
                step: currentStep.title,
                question: currentStep.question,
                answer: answer,
                confidence: confidence
            });
            
            // Update summary list
            updateSummaryList();
            
            // Move to next step
            currentStepIndex++;
            displayStep(currentStepIndex);
            
        } else {
            // User needs help - show results
            showResults(currentStep);
        }
    }

    /**
     * Updates the summary list to show user's progress
     */
    function updateSummaryList() {
        summaryList.innerHTML = '';
        
        userPlan.forEach((entry, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <strong>${entry.step}</strong> — 
                Confidence: ${entry.confidence}/5
            `;
            summaryList.appendChild(li);
        });
    }

    /**
     * Shows the results section based on the step the user
     * was stuck on.
     * @param {object} failedStep - The step object from allSteps
     */
    function showResults(failedStep) {
        // Hide diagnostic tool, show results
        diagnosticTool.classList.add('hidden');
        resultsSection.classList.remove('hidden');
        
        // Get the key we're looking for, e.g., "framing"
        const failedKey = failedStep.csvKey;
        
        // Store filtered activities in our module-level variable
        lastRecommendedActivities = allActivities.filter(activity => {
            // Normalize the activity's step to lowercase, e.g., "framing", "core techniques"
            const activityStepLower = activity.step.toLowerCase();
            
            // Check if it matches the failed step OR the universal categories
            return activityStepLower === failedKey || 
                   activityStepLower === "core techniques" || 
                   activityStepLower === "discussions";
        });
        
        // Update preamble
        const preamble = document.getElementById('results-preamble');
        preamble.textContent = `You need help with "${failedStep.title}". Here are ${lastRecommendedActivities.length} activities that can help:`;
        
        // Clear previous results
        resultsList.innerHTML = '';
        
        // Build HTML cards for each activity
        lastRecommendedActivities.forEach(activity => {
            const card = document.createElement('div');
            card.className = 'activity-card';
            card.innerHTML = `
                <h3>${activity.name}</h3>
                <p class="activity-meta">
                    <strong>Duration:</strong> ${activity.duration} | 
                    <strong>Category:</strong> ${activity.step}
                </p>
                <p class="activity-about">${activity.about}</p>
                ${activity.description ? `<p class="activity-description">${activity.description}</p>` : ''}
            `;
            resultsList.appendChild(card);
        });
        
        // Add this failure to the userPlan for export
        // Check if it's already added (prevents duplicates)
        const lastPlanItem = userPlan[userPlan.length - 1];
        if (!lastPlanItem || lastPlanItem.step !== failedStep.title) {
            userPlan.push({
                step: failedStep.title,
                question: failedStep.question,
                answer: "I need help with this step.",
                confidence: "N/A"
            });
        }
    }

    /**
     * Shows final summary when user completes all 7 steps
     */
    function showFinalSummary() {
        diagnosticTool.classList.add('hidden');
        resultsSection.classList.remove('hidden');
        
        const preamble = document.getElementById('results-preamble');
        preamble.textContent = '🎉 Congratulations! You\'ve completed the diagnostic. You\'re ready to move forward.';
        
        resultsList.innerHTML = `
            <div class="success-message">
                <h3>All Steps Completed</h3>
                <p>You have clear answers and high confidence across all 7 discovery steps.</p>
                <p>Use the "Export Plan" button below to save your responses.</p>
            </div>
        `;
    }

    /**
     * Exports the user's plan as a text file
     */
    function exportPlan() {
        let textContent = "My Discovery Assistant Plan\n";
        textContent += "==============================\n\n";

        // 1. Add all the user's confident answers
        textContent += "## Your Confident Answers ##\n\n";
        
        const confidentAnswers = userPlan.filter(item => item.confidence !== "N/A");

        if (confidentAnswers.length > 0) {
            confidentAnswers.forEach(item => {
                textContent += `--- STEP: ${item.step} ---\n`;
                textContent += `Question: ${item.question}\n`;
                textContent += `Answer: ${item.answer}\n`;
                textContent += `Confidence: ${item.confidence} / 5\n\n`;
            });
        } else {
            textContent += "No confident answers were provided.\n\n";
        }

        // 2. Add the recommended activities (if any)
        if (lastRecommendedActivities.length > 0) {
            // Find the step title that failed
            const failedStep = userPlan.find(item => item.confidence === "N/A");
            const stepTitle = failedStep ? failedStep.step : "your final step";

            textContent += `## Recommended Activities for: ${stepTitle} ##\n\n`;
            
            lastRecommendedActivities.forEach(activity => {
                textContent += `--- ${activity.name} ---\n`;
                textContent += `Category: ${activity.step}\n`;
                textContent += `Duration: ${activity.duration}\n`;
                textContent += `About: ${activity.about}\n\n`;
            });
        }

        // 3. Create and download the file
        const blob = new Blob([textContent], { type: 'text/plain' });
        const anchor = document.createElement('a');
        anchor.download = 'Discovery-Plan.txt';
        anchor.href = window.URL.createObjectURL(blob);
        anchor.style.display = 'none';
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
    }

    // --- 4. EVENT LISTENERS ---
    
    // Main "Submit" button
    btnSubmit.addEventListener('click', handleSubmit);
    
    // "I need help" button
    btnNo.addEventListener('click', () => {
        // This is a direct path to the results
        showResults(allSteps[currentStepIndex]);
    });
    
    // "Start Over" button
    btnRestart.addEventListener('click', () => {
        // Reset state
        currentStepIndex = 0;
        userPlan = [];
        lastRecommendedActivities = [];

        // Reset UI
        summaryList.innerHTML = '';
        resultsList.innerHTML = '';

        // Toggle visibility
        resultsSection.classList.add('hidden');
        diagnosticTool.classList.remove('hidden');
        
        // Display the first step
        displayStep(0);
    });
    
    // "Export Plan" button
    btnExport.addEventListener('click', exportPlan);

    // --- 5. INITIALIZATION ---
    // Start the app!
    initializeApp();

});

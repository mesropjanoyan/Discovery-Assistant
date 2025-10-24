// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. STATE MANAGEMENT ---
    // We'll store all our data and app state in these variables
    let allSteps = [];
    let allActivities = [];
    let currentStepIndex = 0;
    let userPlan = []; // To store answers for the export feature

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
        
        // Find all matching activities (case-insensitive)
        const filteredActivities = allActivities.filter(activity => {
            // Normalize the activity's step to lowercase, e.g., "framing", "core techniques"
            const activityStepLower = activity.step.toLowerCase();
            
            // Check if it matches the failed step OR the universal categories
            return activityStepLower === failedKey || 
                   activityStepLower === "core techniques" || 
                   activityStepLower === "discussions";
        });
        
        // Update preamble
        const preamble = document.getElementById('results-preamble');
        preamble.textContent = `You need help with "${failedStep.title}". Here are ${filteredActivities.length} activities that can help:`;
        
        // Clear previous results
        resultsList.innerHTML = '';
        
        // Build HTML cards for each activity
        filteredActivities.forEach(activity => {
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
        let planText = '=== DISCOVERY ASSISTANT - YOUR PLAN ===\n\n';
        
        userPlan.forEach((entry, index) => {
            planText += `STEP ${index + 1}: ${entry.step}\n`;
            planText += `Question: ${entry.question}\n`;
            planText += `Your Answer: ${entry.answer}\n`;
            planText += `Confidence: ${entry.confidence}/5\n\n`;
        });
        
        planText += `Generated: ${new Date().toLocaleString()}\n`;
        
        // Create and download file
        const blob = new Blob([planText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `discovery-plan-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
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
        // Reset state and show step 0
        currentStepIndex = 0;
        userPlan = [];
        summaryList.innerHTML = '';
        resultsSection.classList.add('hidden');
        diagnosticTool.classList.remove('hidden');
        displayStep(0);
    });
    
    // "Export Plan" button
    btnExport.addEventListener('click', exportPlan);

    // --- 5. INITIALIZATION ---
    // Start the app!
    initializeApp();

});

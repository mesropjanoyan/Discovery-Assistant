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
    const completedStepsContainer = document.getElementById('completed-steps-container');
    const currentStepCard = document.getElementById('current-step-card');
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
     * Creates a "frozen" read-only card for a completed step
     * and appends it to the completed steps container.
     * @param {object} step - The step object from allSteps
     * @param {string} answer - The user's provided answer
     * @param {string} confidence - The user's confidence rating
     */
    function createCompletedStepCard(step, answer, confidence) {
        const card = document.createElement('div');
        card.className = 'completed-step-card'; // We can style this later
        
        // Build the HTML for the completed card
        card.innerHTML = `
            <div class="step-card-header">
                <span class="emoji-large">${step.emoji}</span>
                <div>
                    <h2>${step.title}</h2>
                    <p>${step.question}</p>
                </div>
            </div>
            <div class="step-card-answer">
                <p><strong>Your Answer:</strong> ${answer}</p>
                <p><strong>Confidence:</strong> ${confidence} / 5</p>
            </div>
        `;
        
        // Add a visual separator
        card.style.borderBottom = '2px solid var(--border-color)';
        card.style.paddingBottom = '1.5rem';
        card.style.marginBottom = '1.5rem';

        completedStepsContainer.appendChild(card);
    }

    /**
     * Gathers user input, checks confidence, and moves to the next step
     * or shows the results.
     */
    function handleSubmit() {
        const answer = stepAnswer.value.trim();
        const confidenceRadio = document.querySelector('input[name="confidence"]:checked');
        const confidence = confidenceRadio ? confidenceRadio.value : null;

        const currentStep = allSteps[currentStepIndex];

        // Check for "confident" submission
        if (answer && confidence && parseInt(confidence) >= 3) {
            // --- THIS IS THE NEW LOGIC ---
            
            // 1. Add to our data plan
            userPlan.push({
                step: currentStep.title,
                question: currentStep.question,
                answer: answer,
                confidence: confidence
            });

            // 2. "Freeze" the step we just answered and add it to the DOM
            createCompletedStepCard(currentStep, answer, confidence);

            // 3. Advance to the next step
            currentStepIndex++;
            if (currentStepIndex < allSteps.length) {
                displayStep(currentStepIndex);
            } else {
                showFinalSummary();
            }
            
        } else {
            // User is not confident or didn't answer
            showResults(currentStep);
        }
    }

    /**
     * Shows the results section based on the step the user
     * was stuck on.
     * @param {object} failedStep - The step object from allSteps
     */
    function showResults(failedStep) {
        // Hide the form on the *current step*
        currentStepCard.classList.add('form-hidden');
        // Also hide the main controls
        diagnosticTool.classList.add('form-hidden'); 

        // Show the results section
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
                <button class="btn-read-more" data-activity-name="${activity.name}">Read More</button>
                <div class="activity-details hidden"></div>
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
     * Displays a final "complete" message when all 7 steps are
     * answered confidently.
     */
    function showFinalSummary() {
        // Hide the final step's form and controls
        currentStepCard.classList.add('form-hidden');
        diagnosticTool.classList.add('form-hidden'); 

        // Show the results section
        resultsSection.classList.remove('hidden');
        
        // Update the preamble text
        const preamble = document.getElementById('results-preamble');
        preamble.textContent = "Congratulations!";

        // Clear any previous results and show the success message
        resultsList.innerHTML = `
            <p style="font-size: 1.1rem; color: var(--text-dark);">
                You've confidently completed all 7 steps of the diagnostic.
                Your full plan is summarized above and ready to be exported.
            </p>
        `;
    }

    /**
     * Exports the user's plan as a text file
     */
    function exportPlan() {
        let textContent = "My Pathlight Plan\n";
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
        anchor.download = 'Pathlight-Plan.txt';
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
        completedStepsContainer.innerHTML = ''; // <-- NEW
        resultsList.innerHTML = '';

        // Toggle visibility
        resultsSection.classList.add('hidden');
        diagnosticTool.classList.remove('form-hidden');
        currentStepCard.classList.remove('form-hidden'); // <-- NEW
        
        // Display the first step
        displayStep(0);
    });
    
    // "Export Plan" button
    btnExport.addEventListener('click', exportPlan);

    // Event delegation for "Read More" buttons on the results list
    resultsList.addEventListener('click', (event) => {
        // Only act if a "Read More" button was clicked
        if (!event.target.classList.contains('btn-read-more')) {
            return;
        }

        const clickedButton = event.target;
        const detailsContainer = clickedButton.nextElementSibling;
        const activityName = clickedButton.dataset.activityName;

        // Check if the clicked one was already open
        const wasOpen = !detailsContainer.classList.contains('hidden');

        // --- 1. FIRST, CLOSE ALL CARDS ---
        // Find all detail containers in the resultsList
        const allDetailContainers = resultsList.querySelectorAll('.activity-details');
        
        allDetailContainers.forEach(container => {
            container.classList.add('hidden');
            container.innerHTML = ''; // Clear content to save memory
        });

        // Reset all button texts
        const allButtons = resultsList.querySelectorAll('.btn-read-more');
        allButtons.forEach(button => {
            button.textContent = 'Read More';
        });

        // --- 2. THEN, IF IT WAS CLOSED, OPEN THE CLICKED ONE ---
        if (!wasOpen) {
            // Find the full activity object from our state
            const activity = allActivities.find(act => act.name === activityName);

            if (activity) {
                // Build the new HTML for the details
                let instructionsHTML = activity.instructions.map(step => `<li>${step}</li>`).join('');
                
                detailsContainer.innerHTML = `
                    <p><strong>Description:</strong> ${activity.description || 'No description available.'}</p>
                    <p><strong>Instructions:</strong></p>
                    <ol>${instructionsHTML || 'No instructions available.'}</ol>
                `;
                
                // Show the container
                detailsContainer.classList.remove('hidden');
                // Update the button text
                clickedButton.textContent = 'Read Less';
            }
        }
        // If it *was* open, the 'CLOSE ALL' step already handled it,
        // and it will simply stay closed.
    });

    // --- 5. INITIALIZATION ---
    // Start the app!
    initializeApp();

});

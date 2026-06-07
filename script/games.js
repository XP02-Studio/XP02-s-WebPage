document.addEventListener('DOMContentLoaded', () => {
    const targetPad = document.getElementById('reaction-pad');
    const currentDisplay = document.getElementById('reaction-current');
    const bestDisplay = document.getElementById('reaction-best');
    
    if (!targetPad) return; // Safely aborts if user is browsing a page without the game

    let engineState = "idle"; // States: idle, waiting, triggered
    let delayTimerId = null;
    let baselineTimestamp = 0;
    let internalRecord = localStorage.getItem('local_reflex_record') || null;

    // Load established metrics from device hardware memory if they exist
    if (internalRecord) {
        bestDisplay.textContent = `Personal Record: ${internalRecord}ms`;
    }

    targetPad.addEventListener('mousedown', () => {
        if (engineState === "idle") {
            // Shift to warning mode and queue up a random time gap
            engineState = "waiting";
            targetPad.className = "pad-waiting";
            targetPad.textContent = "Hold... Wait for Green";
            currentDisplay.textContent = "Current: Cooking...";

            const calculatedInterval = Math.floor(Math.random() * (4500 - 1200 + 1)) + 1200; // Between 1.2 and 4.5 seconds
            
            delayTimerId = setTimeout(() => {
                engineState = "triggered";
                targetPad.className = "pad-triggered";
                targetPad.textContent = "CLICK NOW!";
                baselineTimestamp = performance.now(); // High-resolution local timestamp
            }, calculatedInterval);

        } else if (engineState === "waiting") {
            // Penalize users who pull the trigger too early
            clearTimeout(delayTimerId);
            engineState = "idle";
            targetPad.className = "pad-idle";
            targetPad.textContent = "Too Early! Click to Reset";
            currentDisplay.textContent = "Current: DQ (Disqualified)";

        } else if (engineState === "triggered") {
            // Calculate precise score differential
            const clickTimestamp = performance.now();
            const totalScoreTime = Math.round(clickTimestamp - baselineTimestamp);
            
            engineState = "idle";
            targetPad.className = "pad-idle";
            targetPad.textContent = `${totalScoreTime} ms! Test Again?`;
            currentDisplay.textContent = `Current: ${totalScoreTime}ms`;

            // Validate against the recorded personal best score
            if (!internalRecord || totalScoreTime < parseInt(internalRecord)) {
                internalRecord = totalScoreTime;
                localStorage.setItem('local_reflex_record', internalRecord);
                bestDisplay.textContent = `Personal Record: ${internalRecord}ms 🔥`;
            } else {
                bestDisplay.textContent = `Personal Record: ${internalRecord}ms`;
            }
        }
    });
});
document.addEventListener('DOMContentLoaded', () => {
    const targetPad = document.getElementById('reaction-pad');
    const currentDisplay = document.getElementById('reaction-current');
    const bestDisplay = document.getElementById('reaction-best');
    const leaderboardBody = document.getElementById('leaderboard-body');
    const bulbs = document.querySelectorAll('.bulb');
    
    if (!targetPad) return; 

    let engineState = "idle"; 
    let baselineTimestamp = 0;
    let lightTimers = [];
    let launchTimerId = null;
    let audioCtx = null;
    
    let internalRecord = localStorage.getItem('local_reflex_record') || null;

    if (internalRecord) {
        bestDisplay.textContent = `Personal Record: ${internalRecord}ms`;
    } else {
        bestDisplay.textContent = `Personal Record: --`;
    }

    const driverPools = {
        god: ["Max Verstappen", "Lewis Hamilton", "Ayrton Senna", "Michael Schumacher"],
        pro: ["Charles Leclerc", "Lando Norris", "Oscar Piastri", "George Russell", "Fernando Alonso"],
        mid: ["Alex Albon", "Pierre Gasly", "Esteban Ocon", "Yuki Tsunoda", "Lance Stroll"],
        low: ["Logan Sargeant", "Nikita Mazepin", "Nicholas Latifi"]
    };

    // Synthesize Audio Effects via Web Audio API
    function playSynthTone(frequency, type, duration) {
        try {
            // Lazy initialization to clear modern browser security blocks
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }

            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();

            oscillator.type = type; // 'sine', 'square', 'sawtooth', 'triangle'
            oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
            
            // Smooth volume fade out to prevent clicking artifacts
            gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            oscillator.start();
            oscillator.stop(audioCtx.currentTime + duration);
        } catch (e) {
            console.warn("Audio Context blocked or unsupported:", e);
        }
    }

    function getRandomDriver(pool) {
        return pool[Math.floor(Math.random() * pool.length)];
    }

    function getDriverTierInfo(ms) {
        if (ms === 0 || ms > 500) return { tier: "Unranked / Tractor", key: "low" };
        if (ms < 100) return { tier: "God Mode", key: "god" };
        if (ms <= 160) return { tier: "Elite Champion", key: "god" };
        if (ms <= 210) return { tier: "Pro Grid Racer", key: "pro" };
        if (ms <= 280) return { tier: "Midfield Competitor", key: "mid" };
        return { tier: "Tractor Tier", key: "low" };
    }

    function renderingLeaderboard(userMs) {
        leaderboardBody.innerHTML = ""; 
        const userInfo = getDriverTierInfo(userMs);
        
        let driversData = [
            { name: "YOU", ms: userMs, tier: userInfo.tier, isUser: true }
        ];

        const tiersList = ["god", "pro", "mid", "low"];
        const scores = { god: 135, pro: 185, mid: 240, low: 340 };
        const tierLabels = { god: "Elite Champion", pro: "Pro Grid Racer", mid: "Midfield Competitor", low: "Tractor Tier" };

        tiersList.forEach(tKey => {
            let name = getRandomDriver(driverPools[tKey]);
            let noise = Math.floor(Math.random() * 30) - 15; 
            let targetMs = scores[tKey] + noise;

            if (!driversData.some(d => d.name === name)) {
                driversData.push({
                    name: name,
                    ms: targetMs,
                    tier: tierLabels[tKey],
                    isUser: false
                });
            }
        });

        while(driversData.length < 5) {
            driversData.push({ name: "Valtteri Bottas", ms: 148, tier: "Pro Grid Racer", isUser: false });
        }

        driversData.sort((a, b) => {
            if (a.ms === 0) return 1;   
            if (b.ms === 0) return -1;  
            return a.ms - b.ms;         
        });

        driversData.slice(0, 5).forEach((driver, index) => {
            const row = document.createElement('tr');
            if (driver.isUser) row.className = "user-row";
            const timingText = driver.ms === 0 ? "No Time" : `${driver.ms}ms`;
            
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${driver.name}</td>
                <td>${timingText}</td>
                <td>${driver.tier}</td>
            `;
            leaderboardBody.appendChild(row);
        });
    }

    const initialBootScore = internalRecord ? parseInt(internalRecord) : 0;
    renderingLeaderboard(initialBootScore);

    function clearAllTimers() {
        lightTimers.forEach(id => clearTimeout(id));
        lightTimers = [];
        clearTimeout(launchTimerId);
        launchTimerId = null;
    }

    function resetLights() {
        bulbs.forEach(b => b.classList.remove('red', 'green'));
    }

    targetPad.addEventListener('mousedown', () => {
        if (engineState === "idle") {
            engineState = "countdown";
            targetPad.className = "pad-waiting";
            targetPad.textContent = "WATCH THE LIGHTS...";
            currentDisplay.textContent = "Current: Staging...";
            resetLights();
            clearAllTimers();

            // Ignite 5 pairs of red bulbs sequentially + trigger a crisp sync beep
            for (let i = 0; i < 5; i++) {
                let timer = setTimeout(() => {
                    bulbs[i * 2].classList.add('red');
                    bulbs[(i * 2) + 1].classList.add('red');
                    // Play a distinct high pitch F1 light indicator beep
                    playSynthTone(880, 'sine', 0.12);
                }, i * 800);
                lightTimers.push(timer);
            }

            const absoluteLightsLitTimestamp = 4000;
            const randomHoldTime = Math.floor(Math.random() * 2500) + 1500;

            launchTimerId = setTimeout(() => {
                engineState = "triggered";
                targetPad.className = "pad-triggered";
                targetPad.textContent = "LIGHTS OUT! LAUNCH!";
                
                bulbs.forEach(b => {
                    b.classList.remove('red');
                    b.classList.add('green');
                });

                // Play the distinct, deep racing launch cue frequency
                playSynthTone(440, 'sawtooth', 0.35);
                baselineTimestamp = performance.now();
            }, absoluteLightsLitTimestamp + randomHoldTime);

        } else if (engineState === "countdown") {
            // Jumpstart Penalization Route
            clearAllTimers();
            engineState = "idle";
            targetPad.className = "pad-idle";
            targetPad.textContent = "Jump Start! Click to Re-stage Grid";
            currentDisplay.textContent = "Current: DQ (Disqualified)";
            resetLights();
            
            // Play a harsh error buzz tone to indicate a false start
            playSynthTone(120, 'sawtooth', 0.4);

        } else if (engineState === "triggered") {
            const clickTimestamp = performance.now();
            const totalScoreTime = Math.round(clickTimestamp - baselineTimestamp);
            
            engineState = "idle";
            targetPad.className = "pad-idle";
            
            const evaluation = getDriverTierInfo(totalScoreTime);
            targetPad.innerHTML = `${totalScoreTime} ms<br><span style="font-size: 14px; font-weight:400;">Tier: ${evaluation.tier}</span>`;
            currentDisplay.textContent = `Current: ${totalScoreTime}ms`;

            renderingLeaderboard(totalScoreTime);

            if (!internalRecord || totalScoreTime < parseInt(internalRecord)) {
                internalRecord = totalScoreTime;
                localStorage.setItem('local_reflex_record', internalRecord);
                bestDisplay.textContent = `Personal Record: ${internalRecord}ms 🔥`;
            }
        }
    });
});
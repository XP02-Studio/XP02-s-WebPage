document.addEventListener('DOMContentLoaded', () => {
    const banner = document.getElementById('cookie-banner');
    const acceptBtn = document.getElementById('accept-btn');
    const rejectBtn = document.getElementById('reject-btn');
    const resetBtn = document.getElementById('reset-btn');
    const displayEl = document.getElementById('interaction-counter');

    // 1. Check if user has already given permission
    let permission = localStorage.getItem('stats_permission'); // 'true', 'false', or null

    // 2. Show banner if no choice has been made
    if (permission === null) {
        banner.style.display = 'block';
    }
    let lastClickTime = 0;

    // 3. Logic to update the count
    const updateCount = (event) => {
        if (localStorage.getItem('stats_permission') === 'true') {
            
            // --- FIX: Prevent double counting on tabs/radio buttons ---
            const currentTime = Date.now();
            if (currentTime - lastClickTime < 50) { 
                return; // If another click happens within 50ms, ignore it!
            }
            lastClickTime = currentTime;
            // ---------------------------------------------------------

            let count = parseInt(localStorage.getItem('global_interactions')) || 0;
            count++;
            localStorage.setItem('global_interactions', count);
            if (displayEl) displayEl.textContent = count.toLocaleString();
        }
    };

    // 4. Permission Button Listeners
    acceptBtn.addEventListener('click', () => {
        localStorage.setItem('stats_permission', 'true');
        banner.style.display = 'none';
        // Initialize UI after accepting
        if (displayEl) displayEl.textContent = (localStorage.getItem('global_interactions') || 0);
    });

    rejectBtn.addEventListener('click', () => {
        localStorage.setItem('stats_permission', 'false');
        banner.style.display = 'none';
    });

    // 5. Reset Button Listener
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            localStorage.setItem('global_interactions', -1); // Reset count
            if (displayEl) displayEl.textContent = "0";
            alert("Stats have been reset to 0!");
        });
    }

    // 6. Global Click Listener
    window.addEventListener('click', updateCount);

    // Initial UI Sync
    if (displayEl && localStorage.getItem('stats_permission') === 'true') {
        displayEl.textContent = (localStorage.getItem('global_interactions') || 0);
    }
});

// --- FEATURE: RANDOM CHARACTER ANIMATION ENGINE ---

// 1. Define your assets (Replace placeholders with your real asset paths)
const characterAnimations = [
    { src: '../assets/anim/cat(1)_gif.gif' , type: 'image' },
    { src: '../assets/anim/greeting_gif.gif', type: 'image' },
    { src: '../assets/anim/Spiderman_hanging_gif.gif', type: 'image' }
];

// 2. Define the edge configurations (Where they appear and hide)
const screenEdges = [
    { 
        name: 'left', 
        start: { left: '-160px', top: '40%', bottom: 'auto', right: 'auto' }, 
        show: { left: '20px' } 
    },
    { 
        name: 'right', 
        start: { right: '-160px', top: '50%', bottom: 'auto', left: 'auto' }, 
        show: { right: '20px' } 
    },
    { 
        name: 'bottom', 
        start: { bottom: '-160px', left: '45%', top: 'auto', right: 'auto' }, 
        show: { bottom: '0px' } 
    },
    { 
        name: 'top', 
        start: { top: '-160px', left: '20%', bottom: 'auto', right: 'auto' }, 
        show: { top: '10px' } 
    }
];

const triggerRandomAnimation = () => {
    const stage = document.getElementById('character-stage');
    if (!stage) return;

    // Pick a random animation and a random edge
    const randomAnim = characterAnimations[Math.floor(Math.random() * characterAnimations.length)];
    const randomEdge = screenEdges[Math.floor(Math.random() * screenEdges.length)];

    // Inject the selected asset (handles gifs or short video loops)
    if (randomAnim.type === 'image') {
        stage.innerHTML = `<img src="${randomAnim.src}" alt="easter-egg">`;
    }

    // Reset styles and position stage at its starting off-screen point
    stage.style.display = 'block';
    Object.assign(stage.style, {
        top: 'auto', bottom: 'auto', left: 'auto', right: 'auto',
        ...randomEdge.start
    });

    // Step 1: Slide into view (Happens slightly after setup to allow CSS transition)
    setTimeout(() => {
        Object.assign(stage.style, randomEdge.show);
    }, 100);

    // Step 2: Leave it on screen for 4 seconds, then slide back out
    setTimeout(() => {
        Object.assign(stage.style, randomEdge.start);
        
        // Step 3: Completely hide element after slide out finishes
        setTimeout(() => {
            stage.style.display = 'none';
            stage.innerHTML = '';
            
            // Queue up the NEXT random encounter!
            queueNextAnimation();
        }, 500);
    }, 4000);
};
window.triggerRandomAnimation = triggerRandomAnimation;

// 4. Timer Engine: Controls the randomness of intervals
const queueNextAnimation = () => {
    // Generate a random time between 15 seconds (15000ms) and 45 seconds (45000ms)
    const randomDelay = Math.floor(Math.random() * (45000 - 15000 + 1)) + 15000;
    
    setTimeout(() => {
        triggerRandomAnimation();
    }, randomDelay);
};

// 5. Fire off the first sequence cycle after the user loads the page
// (Delayed slightly so it doesn't scare them instantly)
setTimeout(queueNextAnimation, 10000);


// document.addEventListener('DOMContentLoaded', () => {
//     const banner = document.getElementById('cookie-banner');
//     const acceptBtn = document.getElementById('accept-btn');
//     const rejectBtn = document.getElementById('reject-btn');
//     const resetBtn = document.getElementById('reset-btn');
//     const displayEl = document.getElementById('interaction-counter');
    
//     // New Viewer Element
//     const viewersEl = document.getElementById('viewers-counter');

//     // 1. Check if user has already given permission
//     let permission = localStorage.getItem('stats_permission'); 

//     // 2. Show banner if no choice has been made
//     if (permission === null) {
//         if (banner) banner.style.display = 'block';
//     }

//     // --- FIX: Prevent double counting on tabs/radio buttons ---
//     let lastClickTime = 0;

//     // 3. Logic to update the count
//     const updateCount = () => {
//         if (localStorage.getItem('stats_permission') === 'true') {
            
//             const currentTime = Date.now();
//             if (currentTime - lastClickTime < 50) { 
//                 return; // Ignore duplicate ghost clicks
//             }
//             lastClickTime = currentTime;

//             let count = parseInt(localStorage.getItem('global_interactions')) || 0;
//             count++;
//             localStorage.setItem('global_interactions', count);
//             if (displayEl) displayEl.textContent = count.toLocaleString();
//         }
//     };

//     // --- NEW: Function to check and track new viewers ---
//     const trackNewViewer = () => {
//         if (localStorage.getItem('stats_permission') === 'true') {
//             // Check if they have visited before
//             let isReturning = localStorage.getItem('is_returning_visitor');
            
//             let totalViewers = parseInt(localStorage.getItem('total_new_viewers')) || 0;

//             if (!isReturning) {
//                 // This is a brand new viewer!
//                 totalViewers++;
//                 localStorage.setItem('total_new_viewers', totalViewers);
//                 localStorage.setItem('is_returning_visitor', 'true'); // Mark them so they aren't counted again
//             }

//             if (viewersEl) viewersEl.textContent = totalViewers.toLocaleString();
//         }
//     };

//     // 4. Permission Button Listeners
//     if (acceptBtn) {
//         acceptBtn.addEventListener('click', () => {
//             localStorage.setItem('stats_permission', 'true');
//             if (banner) banner.style.display = 'none';
            
//             // Initialize UI after accepting
//             if (displayEl) displayEl.textContent = (localStorage.getItem('global_interactions') || 0);
            
//             // Run the viewer tracking now that we have permission
//             trackNewViewer();
//         });
//     }

//     if (rejectBtn) {
//         rejectBtn.addEventListener('click', () => {
//             localStorage.setItem('stats_permission', 'false');
//             if (banner) banner.style.display = 'none';
//         });
//     }

//     // 5. Reset Button Listener
//     if (resetBtn) {
//         resetBtn.addEventListener('click', () => {
//             localStorage.setItem('global_interactions', -1); 
//             localStorage.setItem('total_new_viewers', 0); // Also reset viewers
//             localStorage.removeItem('is_returning_visitor'); // Reset their status
            
//             if (displayEl) displayEl.textContent = "0";
//             if (viewersEl) viewersEl.textContent = "0";
//             alert("Stats and viewer counts have been reset!");
//         });
//     }

//     // 6. Global Click Listener
//     window.addEventListener('click', updateCount);

//     // Initial UI Sync on Page Load
//     if (localStorage.getItem('stats_permission') === 'true') {
//         if (displayEl) displayEl.textContent = (localStorage.getItem('global_interactions') || 0);
        
//         // Run on page load for returning users to sync the display
//         trackNewViewer();
//     }
// });
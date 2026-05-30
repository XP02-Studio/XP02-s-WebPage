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
        if (banner) banner.style.display = 'block';
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
    if (acceptBtn) {
        acceptBtn.addEventListener('click', () => {
            localStorage.setItem('stats_permission', 'true');
            if (banner) banner.style.display = 'none';
            // Initialize UI after accepting
            if (displayEl) displayEl.textContent = (localStorage.getItem('global_interactions') || 0);
        });
    }

    if (rejectBtn) {
        rejectBtn.addEventListener('click', () => {
            localStorage.setItem('stats_permission', 'false');
            if (banner) banner.style.display = 'none';
        });
    }

    // 5. Reset Button Listener
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            localStorage.setItem('global_interactions', -1); 
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

// 1. Array of animations where each character handles its own coordinates and timing details
const characterAnimations = [
    { 
        name: 'cat',
        src: '../assets/anim/cat(1)_gif.gif', 
        type: 'image', 
        width: '130px', 
        height: '130px', 
        duration: 4800,
        // Drops up from the bottom edge, settles in the bottom-left area
        start: { bottom: '-160px', left: '50px', top: 'auto', right: 'auto' },
        show: { bottom: '0px' }
    },
    { 
        name: 'greeting',
        src: '../assets/anim/greeting_gif.gif', 
        type: 'image', 
        width: '200px', 
        height: '200px', 
        duration: 2700,
        // Slides left out of the right side, settles in the bottom-right area
        start: { right: '-230px', bottom: '50px', top: 'auto', left: 'auto' },
        show: { right: '20px' }
    },
    { 
        name: 'spiderman',
        src: '../assets/anim/Spiderman_hanging_gif.gif', 
        type: 'image', 
        width: '100px', 
        height: '400px', 
        duration: 2700,
        // Drops down from the ceiling, settles in the top-left area
        start: { top: '-280px', left: '40px', bottom: 'auto', right: 'auto' },
        show: { top: '0px' }
    }
];

const triggerRandomAnimation = () => {
    const stage = document.getElementById('character-stage');
    if (!stage) return;

    // Pick a completely random animation configuration from our list
    const randomAnim = characterAnimations[Math.floor(Math.random() * characterAnimations.length)];

    // Inject asset with dynamic dimensions matching the config
    if (randomAnim.type === 'image') {
        stage.innerHTML = `<img src="${randomAnim.src}" style="width: ${randomAnim.width}; height: ${randomAnim.height}; display: block;" alt="random-anim">`;
    }

    // Reset styles and apply the specific off-screen hidden starting coordinates
    stage.style.display = 'block';
    Object.assign(stage.style, {
        top: 'auto', bottom: 'auto', left: 'auto', right: 'auto',
        ...randomAnim.start
    });

    // Step 1: Slide into view using the custom show placement rules
    setTimeout(() => {
        Object.assign(stage.style, randomAnim.show);
    }, 100);

    // Step 2: Leave it on screen based on character's specific duration attribute
    setTimeout(() => {
        // Slide back out to its original starting hide location
        Object.assign(stage.style, randomAnim.start);
        
        // Step 3: Completely clear HTML structures after sliding out transitions finish
        setTimeout(() => {
            stage.style.display = 'none';
            stage.innerHTML = '';
            
            // Queue up the next random encounter
            queueNextAnimation();
        }, 500);
    }, randomAnim.duration);
};

// Expose to window scope so you can run triggerRandomAnimation() in your DevTools Console
window.triggerRandomAnimation = triggerRandomAnimation;

// 4. Timer Engine: Controls the delay intervals natively
const queueNextAnimation = () => {
    // Generate a random time between 10-20 sec
    const randomDelay = Math.floor(Math.random() * (20000 - 10000 + 1)) + 10000;
    
    setTimeout(() => {
        triggerRandomAnimation();
    }, randomDelay);
};

// 5. Fire off the very first sequence cycle after the user loads the page (5 seconds delay)
setTimeout(queueNextAnimation, 5000);
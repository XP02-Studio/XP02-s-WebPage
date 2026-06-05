document.addEventListener('DOMContentLoaded', () => {
    const banner = document.getElementById('cookie-banner');
    const acceptBtn = document.getElementById('accept-btn');
    const rejectBtn = document.getElementById('reject-btn');
    const resetBtn = document.getElementById('reset-btn');
    const displayEl = document.getElementById('interaction-counter');
    const toggleAnimBtn = document.getElementById('anim-toggle');
    const viewDisplayEl = document.getElementById('view-counter'); 

    // --- TECHNIQUE 1: PRIVATE CLOSURE STATE ENGINE ---
    let _totalViews = parseInt(localStorage.getItem('global_page_views')) || 0;

    // 1. Check if user has already given permission
    let permission = localStorage.getItem('stats_permission'); 

    // 2. Only try to show the banner if it physically exists on this page
    if (permission === null && banner) {
        banner.style.display = 'block';
    }
    let lastClickTime = 0;

    // --- FIXED: Unique Visitor-Guarded View Tracker ---
    const incrementPageView = () => {
        if (localStorage.getItem('stats_permission') === 'true') {
            // Check if this browser has been flagged as a returning user
            const isReturningUser = localStorage.getItem('returning_visitor') === 'true';

            if (!isReturningUser) {
                _totalViews++; 
                localStorage.setItem('global_page_views', _totalViews);
                // Permanent flag: This browser is no longer a "new person"
                localStorage.setItem('returning_visitor', 'true');
            }

            // Always render the verified global total directly to the display element
            if (viewDisplayEl) {
                viewDisplayEl.textContent = _totalViews.toLocaleString();
            }
        }
    };

    // 3. Logic to update the interaction count
    const updateCount = (event) => {
        if (localStorage.getItem('stats_permission') === 'true') {
            const currentTime = Date.now();
            if (currentTime - lastClickTime < 50) return; 
            lastClickTime = currentTime;

            let count = parseInt(localStorage.getItem('global_interactions')) || 0;
            count++;
            localStorage.setItem('global_interactions', count);
            
            if (displayEl) displayEl.textContent = count.toLocaleString();
        }
    };

    // 4. Permission Button Listeners (Added Safety Guards)
    if (acceptBtn) {
        acceptBtn.addEventListener('click', () => {
            localStorage.setItem('stats_permission', 'true');
            if (banner) banner.style.display = 'none';
            if (displayEl) displayEl.textContent = (localStorage.getItem('global_interactions') || 0);
            
            // Process view check immediately upon tracking confirmation
            incrementPageView();
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
            localStorage.setItem('global_interactions', 0); 
            localStorage.setItem('global_page_views', 0);
            localStorage.removeItem('returning_visitor'); // Clear the unique user token
            _totalViews = 0; 
            if (displayEl) displayEl.textContent = "0";
            if (viewDisplayEl) viewDisplayEl.textContent = "0";
            alert("All global stats, unique visitor tokens, and views have been reset to 0!");
        });
    }

    // 6. Global Click Listener
    window.addEventListener('click', updateCount);

    // Initial UI Sync & View Run Execution
    if (localStorage.getItem('stats_permission') === 'true') {
        incrementPageView(); 
        if (displayEl) displayEl.textContent = (localStorage.getItem('global_interactions') || 0).toLocaleString();
    }

    if (toggleAnimBtn) {
        const isEnabled = localStorage.getItem('animations_enabled') !== 'false';
        toggleAnimBtn.textContent = isEnabled ? "Disable Animations" : "Enable Animations";

        toggleAnimBtn.addEventListener('click', () => {
            const currentSetting = localStorage.getItem('animations_enabled') !== 'false';
            const newSetting = !currentSetting;
            
            localStorage.setItem('animations_enabled', newSetting);
            toggleAnimBtn.textContent = newSetting ? "Disable Animations" : "Enable Animations";

            if (newSetting) {
                console.log("Animations enabled. Engine starting...");
                queueNextAnimation();
            }
            console.log("Saving changes and refreshing page...");
            location.reload();
        });
    }
});

// --- FEATURE: RANDOM CHARACTER ANIMATION ENGINE ---

const characterAnimations = [
    { 
        name: 'cat',
        src: '../assets/anim/cat(1)_gif.gif', 
        type: 'image', 
        width: '130px', 
        height: '130px', 
        duration: 4800,
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
        start: { right: '-230px', bottom: '50px', top: 'auto', left: 'auto' },
        show: { right: '0px' }
    },
    { 
        name: 'spiderman',
        src: '../assets/anim/Spiderman_hanging_gif.gif', 
        type: 'image', 
        width: '100px', 
        height: '400px', 
        duration: 2700,
        start: { top: '-280px', left: '40px', bottom: 'auto', right: 'auto' },
        show: { top: '0px' }
    }
];

const triggerRandomAnimation = () => {
    const stage = document.getElementById('character-stage');
    if (!stage) return;

    if (localStorage.getItem('animations_enabled') === 'false') return;

    const randomAnim = characterAnimations[Math.floor(Math.random() * characterAnimations.length)];

    if (randomAnim.type === 'image') {
        stage.innerHTML = `<img src="${randomAnim.src}" style="width: ${randomAnim.width}; height: ${randomAnim.height}; display: block;" alt="random-anim">`;
    }

    stage.style.display = 'block';
    Object.assign(stage.style, {
        top: 'auto', bottom: 'auto', left: 'auto', right: 'auto',
        ...randomAnim.start
    });

    setTimeout(() => {
        Object.assign(stage.style, randomAnim.show);
    }, 100);

    setTimeout(() => {
        Object.assign(stage.style, randomAnim.start);
        
        setTimeout(() => {
            stage.style.display = 'none';
            stage.innerHTML = '';
            queueNextAnimation();
        }, 500);
    }, randomAnim.duration);
};

window.triggerRandomAnimation = triggerRandomAnimation;

const queueNextAnimation = () => {
    if (localStorage.getItem('animations_enabled') === 'false') return;
    const randomDelay = Math.floor(Math.random() * (18000 - 8000 + 1)) + 8000;
    
    setTimeout(() => {
        triggerRandomAnimation();
    }, randomDelay);
};

if (localStorage.getItem('animations_enabled') !== 'false') {
    setTimeout(queueNextAnimation, 5000);
}
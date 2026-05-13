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

    // 3. Logic to update the count
    const updateCount = () => {
        if (localStorage.getItem('stats_permission') === 'true') {
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
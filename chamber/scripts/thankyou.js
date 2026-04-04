document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);

    displayAppDetails(params);

    loadDarkMode();

    initializeMenuToggle();
});

function displayAppDetails(params) {
    const firstName = params.get('first-name') || '-';
    const lastName = params.get('last-name') || '-';
    const email = params.get('email') || '-';
    const phone = params.get('phone') || '-';
    const orgName = params.get('org-name') || '-';
    const timestamp = params.get('timestamp') || '-';

    document.getElementById('detail-firstName').textContent = decodeURIComponent(firstName);
    document.getElementById('detail-lastName').textContent = decodeURIComponent(lastName);
    document.getElementById('detail-email').textContent = decodeURIComponent(email);
    document.getElementById('detail-phone').textContent = decodeURIComponent(phone);
    document.getElementById('detail-orgName').textContent = decodeURIComponent(orgName);
    document.getElementById('detail-timestamp').textContent = decodeURIComponent(timestamp);
}

function loadDarkMode() {
    const darkModeBtn = document.getElementById('dark-mode-btn');
    if (!darkModeBtn) return;

    const isDarkMode = localStorage.getItem('darkMode') === 'enabled';

    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    }

    darkModeBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isNowDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isNowDark ? 'enabled' : 'disabled');
    });
}

function initializeMenuToggle() {
    const menuBtn = document.getElementById('menu-btn');
    const mobileNav = document.getElementById('mobile-nav');

    if (!menuBtn || !mobileNav) return;

    menuBtn.addEventListener('click', () => {
        mobileNav.classList.toggle('open');
        menuBtn.textContent = mobileNav.classList.contains('open') ? '✖' : '☰';
    });

    const mobileLinks = mobileNav.querySelectorAll('a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileNav.classList.remove('open');
            menuBtn.textContent = '☰';
        });
    });
}

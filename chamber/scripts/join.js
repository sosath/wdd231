document.addEventListener('DOMContentLoaded', () => {
    const now = new Date();
    const timestamp = now.toLocaleString();
    document.getElementById('timestamp').value = timestamp;

    initializeModals();

    loadDarkMode();

    initializeMenuToggle();
});

function initializeModals() {
    const infoButtons = document.querySelectorAll('.info-btn');
    const modals = document.querySelectorAll('.modal');
    const closeButtons = document.querySelectorAll('.modal-close');

    infoButtons.forEach(button => {
        button.addEventListener('click', () => {
            const level = button.getAttribute('data-level');
            const modal = document.getElementById(`modal-${level}`);
            if (modal) {
                modal.classList.add('show');
                modal.setAttribute('aria-hidden', 'false');
                // Trap focus in modal
                trapFocus(modal);
            }
        });
    });

    closeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            closeModal(modal);
        });
    });

    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            modals.forEach(modal => {
                if (modal.classList.contains('show')) {
                    closeModal(modal);
                }
            });
        }
    });
}

function closeModal(modal) {
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
}

function trapFocus(modal) {
    const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    modal.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        }
    });
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

    // Close menu when a link is clicked
    const mobileLinks = mobileNav.querySelectorAll('a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileNav.classList.remove('open');
            menuBtn.textContent = '☰';
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('membership-form');

    if (form) {
        form.addEventListener('submit', (e) => {
            const orgTitle = document.getElementById('org-title');
            if (orgTitle.value) {
                const pattern = /^[a-zA-Z\s\-]{7,}$/;
                if (!pattern.test(orgTitle.value)) {
                    e.preventDefault();
                    alert('Organizational Title must be at least 7 characters and contain only letters, spaces, and hyphens.');
                }
            }
        });
    }
});

document.getElementById('currentyear').textContent = new Date().getFullYear();
document.getElementById('lastModified').textContent = document.lastModified;

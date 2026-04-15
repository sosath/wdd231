// Modal dialog

const overlay = document.getElementById('modal-overlay');
const titleEl = document.getElementById('modal-title');
const bodyEl = document.getElementById('modal-body');
const closeBtn = document.getElementById('modal-close');

let previousFocus = null;

export function openModal(title, htmlContent) {
    if (!overlay || !titleEl || !bodyEl) return;
    previousFocus = document.activeElement;
    titleEl.textContent = title;
    bodyEl.innerHTML = htmlContent;
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeBtn?.focus();
}

export function closeModal() {
    if (!overlay) return;
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (previousFocus) {
        previousFocus.focus();
        previousFocus = null;
    }
}

export function initModal() {
    if (!overlay || !closeBtn) return;
    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
    });
}

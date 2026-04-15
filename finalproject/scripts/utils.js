// Utility functions for EuroStats

export function formatDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function buildTeamBadge(abbr, color, textColor = '#ffffff', size = 'md') {
    const styles = size === 'sm' ? 'width:28px;height:28px;font-size:0.55rem' : 'width:44px;height:44px;font-size:0.7rem';
    return `<span style="background:${color};color:${textColor};display:inline-flex;align-items:center;justify-content:center;border-radius:50%;font-weight:700;${styles}">${abbr}</span>`;
}

export function buildFormBadge(result) {
    const colors = { W: '#27AE60', D: '#95A5A6', L: '#E74C3C' };
    return `<span style="display:inline-block;width:18px;height:18px;background:${colors[result] || '#95A5A6'};color:white;text-align:center;border-radius:3px;font-size:0.62rem;font-weight:700;line-height:18px">${result}</span>`;
}

export function getPosClass(status) {
    return ({ knockout: 'knockout', group: 'group', eliminated: 'eliminated' }[status] || '');
}

export function showLoading(container) {
    container.innerHTML = `<div style="padding:3rem;text-align:center;color:#7F8C8D"><span>Loading...</span></div>`;
}

export function showError(container, message) {
    container.innerHTML = `<div style="padding:1.5rem;background:rgba(231,76,60,0.1);color:#E74C3C;border-radius:8px;text-align:center">⚠️ ${message}</div>`;
}

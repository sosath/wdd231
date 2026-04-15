import { formatDate, buildTeamBadge, showLoading, showError } from './utils.js';
import { isFavorite } from './storage.js';
import { initModal, openModal } from './modal.js';

const hamburger = document.getElementById('hamburger');
const mainNav = document.getElementById('main-nav');
if (hamburger && mainNav) {
    hamburger.addEventListener('click', () => {
        const isOpen = mainNav.classList.toggle('open');
        hamburger.classList.toggle('active', isOpen);
        hamburger.setAttribute('aria-expanded', String(isOpen));
    });
}

let teamData = [];

async function fetchJSON(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        throw new Error(`Failed to load: ${error.message}`);
    }
}

function renderAnalysisCards(matches, container, filter = 'all') {
    if (!matches || matches.length === 0) {
        container.innerHTML = '<p class="no-results">No matches to analyse.</p>';
        return;
    }

    let filtered = [...matches];

    if (filter === 'upcoming') {
        filtered = filtered.filter(m => m.status === 'upcoming');
    } else if (filter === 'finished') {
        filtered = filtered.filter(m => m.status === 'finished');
    } else if (filter === 'high') {
        filtered = filtered.filter(m => m.importance === 'high');
    }

    if (filtered.length === 0) {
        container.innerHTML = '<p class="no-results">No matches match this filter.</p>';
        return;
    }

    const html = filtered.map(match => {
        const isFinished = match.status === 'finished';
        const homeTeam = teamData.find(t => t.id === match.homeTeamId);
        const awayTeam = teamData.find(t => t.id === match.awayTeamId);

        const homeBadge = homeTeam
            ? buildTeamBadge(match.homeTeamAbbr, homeTeam.color, homeTeam.textColor)
            : buildTeamBadge(match.homeTeamAbbr, '#2C3E50');

        const awayBadge = awayTeam
            ? buildTeamBadge(match.awayTeamAbbr, awayTeam.color, awayTeam.textColor)
            : buildTeamBadge(match.awayTeamAbbr, '#34495E');

        const resultBadge = isFinished
            ? `<span style="font-family:var(--font-heading);font-weight:700;font-size:1.1rem;background:var(--bg-light);padding:0.3rem 0.8rem;border-radius:4px;">${match.homeScore} – ${match.awayScore}</span>`
            : '';

        return `
      <article class="analysis-card" data-match-id="${match.id}">
        <div class="analysis-card-header">
          <span class="analysis-stage">${match.stage} · ${match.leg}</span>
          <span class="analysis-date">${formatDate(match.date)} ${match.status !== 'finished' ? '· ' + match.time : ''}</span>
        </div>
        <div class="analysis-card-body">
          <div class="analysis-teams">
            <div class="analysis-team">
              ${homeBadge}
              <span class="analysis-team-name">${match.homeTeam}</span>
            </div>
            ${isFinished ? resultBadge : '<span class="vs-divider">VS</span>'}
            <div class="analysis-team">
              ${awayBadge}
              <span class="analysis-team-name">${match.awayTeam}</span>
            </div>
          </div>

          <div class="prob-section">
            <div class="prob-label-row">
              <span>${match.homeTeam}</span>
              <span>Draw</span>
              <span>${match.awayTeam}</span>
            </div>
            <div class="prob-bar-container" role="img"
              aria-label="Win probability: ${match.homeTeam} ${match.homeWinProb}%, Draw ${match.drawProb}%, ${match.awayTeam} ${match.awayWinProb}%">
              <div class="prob-home" style="width:${match.homeWinProb}%"></div>
              <div class="prob-draw" style="width:${match.drawProb}%"></div>
              <div class="prob-away" style="width:${match.awayWinProb}%"></div>
            </div>
            <div class="prob-values">
              <span class="prob-home-val">${match.homeWinProb}%</span>
              <span class="prob-draw-val">${match.drawProb}%</span>
              <span class="prob-away-val">${match.awayWinProb}%</span>
            </div>
          </div>

          <div class="xg-row">
            <span class="xg-label">⚽ Expected Goals (xG)</span>
            <span>
              <span class="xg-value">${match.expectedHomeGoals}</span>
              <span style="color:var(--light-text);margin:0 0.3rem">–</span>
              <span class="xg-value">${match.expectedAwayGoals}</span>
            </span>
          </div>
        </div>
        <div class="analysis-actions">
          <button class="btn btn-sm btn-primary open-h2h" data-match-id="${match.id}">
            View Head-to-Head →
          </button>
        </div>
      </article>`;
    }).join('');

    container.innerHTML = html;

    container.querySelectorAll('.open-h2h').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.matchId, 10);
            const match = matches.find(m => m.id === id);
            if (match) openH2HModal(match);
        });
    });
}

function openH2HModal(match) {
    const h2h = match.headToHead;
    const total = h2h.homeWins + h2h.draws + h2h.awayWins;
    const homeWidth = total > 0 ? Math.round((h2h.homeWins / total) * 100) : 33;
    const drawWidth = total > 0 ? Math.round((h2h.draws / total) * 100) : 34;
    const awayWidth = 100 - homeWidth - drawWidth;

    const homeTeam = teamData.find(t => t.id === match.homeTeamId);
    const awayTeam = teamData.find(t => t.id === match.awayTeamId);

    const homeAttack = homeTeam ? homeTeam.attackStrength.toFixed(1) : 'N/A';
    const awayAttack = awayTeam ? awayTeam.attackStrength.toFixed(1) : 'N/A';
    const homeDefense = homeTeam ? homeTeam.defenseStrength.toFixed(1) : 'N/A';
    const awayDefense = awayTeam ? awayTeam.defenseStrength.toFixed(1) : 'N/A';

    const favLine = (teamId, name) => {
        if (!teamId) return '';
        const fav = isFavorite(teamId);
        return `<span style="font-size:0.75rem;color:${fav ? 'var(--gold)' : 'var(--light-text)'}">
      ${fav ? '★ Following' : ''}
    </span>`;
    };

    const resultLine = match.status === 'finished'
        ? `<div class="modal-detail-row">
        <span class="modal-detail-key">Final Score</span>
        <span class="modal-detail-val">${match.homeScore} – ${match.awayScore}</span>
       </div>`
        : `<div class="modal-detail-row">
        <span class="modal-detail-key">Kick-off</span>
        <span class="modal-detail-val">${formatDate(match.date)} · ${match.time}</span>
       </div>`;

    const content = `
    <div class="h2h-stats">
      <div>
        <div class="h2h-num" style="color:var(--success)">${h2h.homeWins}</div>
        <div class="h2h-team-label">${match.homeTeam} Wins</div>
        ${favLine(match.homeTeamId, match.homeTeam)}
      </div>
      <div class="h2h-vs">${h2h.draws}<br><small>Draws</small></div>
      <div>
        <div class="h2h-num" style="color:var(--danger)">${h2h.awayWins}</div>
        <div class="h2h-team-label">${match.awayTeam} Wins</div>
        ${favLine(match.awayTeamId, match.awayTeam)}
      </div>
    </div>
    <div class="h2h-bar" aria-label="H2H record bar">
      <div class="h2h-bar-home" style="width:${homeWidth}%"></div>
      <div class="h2h-bar-draw" style="width:${drawWidth}%"></div>
      <div class="h2h-bar-away" style="width:${awayWidth}%"></div>
    </div>
    ${resultLine}
    <div class="modal-detail-row">
      <span class="modal-detail-key">Stage</span>
      <span class="modal-detail-val">${match.stage} — ${match.leg}</span>
    </div>
    <div class="modal-detail-row">
      <span class="modal-detail-key">Venue</span>
      <span class="modal-detail-val">${match.venue}, ${match.city}</span>
    </div>
    <div class="modal-detail-row">
      <span class="modal-detail-key">Win Probability</span>
      <span class="modal-detail-val">
        <span style="color:var(--success)">${match.homeWinProb}%</span> /
        <span style="color:var(--draw)">${match.drawProb}%</span> /
        <span style="color:var(--danger)">${match.awayWinProb}%</span>
      </span>
    </div>
    <div class="modal-detail-row">
      <span class="modal-detail-key">Expected Goals</span>
      <span class="modal-detail-val">${match.expectedHomeGoals} – ${match.expectedAwayGoals}</span>
    </div>
    <div class="modal-detail-row">
      <span class="modal-detail-key">Last Meeting</span>
      <span class="modal-detail-val">${h2h.lastResult}</span>
    </div>
    <h3 style="margin:1.2rem 0 0.6rem;font-size:0.9rem;color:var(--primary);">Team Ratings</h3>
    <div class="modal-detail-row">
      <span class="modal-detail-key">Attack Rating</span>
      <span class="modal-detail-val">
        <span style="color:var(--success)">${homeAttack}</span> vs
        <span style="color:var(--danger)">${awayAttack}</span>
      </span>
    </div>
    <div class="modal-detail-row">
      <span class="modal-detail-key">Defense Rating</span>
      <span class="modal-detail-val">
        <span style="color:var(--success)">${homeDefense}</span> vs
        <span style="color:var(--danger)">${awayDefense}</span>
      </span>
    </div>`;

    openModal(`${match.homeTeam} vs ${match.awayTeam} · Analysis`, content);
}

function renderUpcomingHighlight(matches, container) {
    const upcoming = matches
        .filter(m => m.status === 'upcoming' && m.importance === 'high')
        .slice(0, 1)[0];

    if (!upcoming || !container) return;

    const homeTeam = teamData.find(t => t.id === upcoming.homeTeamId);
    const awayTeam = teamData.find(t => t.id === upcoming.awayTeamId);

    const homeBadge = homeTeam
        ? buildTeamBadge(upcoming.homeTeamAbbr, homeTeam.color, homeTeam.textColor)
        : buildTeamBadge(upcoming.homeTeamAbbr, '#2C3E50');
    const awayBadge = awayTeam
        ? buildTeamBadge(upcoming.awayTeamAbbr, awayTeam.color, awayTeam.textColor)
        : buildTeamBadge(upcoming.awayTeamAbbr, '#34495E');

    container.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;gap:2rem;flex-wrap:wrap;margin-bottom:1.5rem;">
      <div style="text-align:center">
        ${homeBadge.replace('team-badge', 'team-badge" style="width:64px;height:64px;font-size:1rem;')}
        <div style="margin-top:0.5rem;font-family:var(--font-sub);font-weight:600">${upcoming.homeTeam}</div>
      </div>
      <div style="text-align:center">
        <div style="font-size:0.8rem;color:var(--light-text);font-family:var(--font-sub);text-transform:uppercase;letter-spacing:1px">${upcoming.stage}</div>
        <div style="font-size:1.5rem;font-family:var(--font-heading);font-weight:700;color:var(--primary);margin:0.3rem 0">VS</div>
        <div style="font-size:0.85rem;color:var(--gold);font-family:var(--font-sub)">${formatDate(upcoming.date)} · ${upcoming.time}</div>
      </div>
      <div style="text-align:center">
        ${awayBadge.replace('team-badge', 'team-badge" style="width:64px;height:64px;font-size:1rem;')}
        <div style="margin-top:0.5rem;font-family:var(--font-sub);font-weight:600">${upcoming.awayTeam}</div>
      </div>
    </div>
    <div style="max-width:400px;margin:0 auto">
      <div class="prob-label-row">
        <span>${upcoming.homeTeam}</span>
        <span>Draw</span>
        <span>${upcoming.awayTeam}</span>
      </div>
      <div class="prob-bar-container" style="height:12px;">
        <div class="prob-home" style="width:${upcoming.homeWinProb}%"></div>
        <div class="prob-draw" style="width:${upcoming.drawProb}%"></div>
        <div class="prob-away" style="width:${upcoming.awayWinProb}%"></div>
      </div>
      <div class="prob-values" style="font-size:1rem;margin-top:0.4rem">
        <span class="prob-home-val">${upcoming.homeWinProb}%</span>
        <span class="prob-draw-val">${upcoming.drawProb}%</span>
        <span class="prob-away-val">${upcoming.awayWinProb}%</span>
      </div>
    </div>
    <div style="text-align:center;margin-top:1.5rem">
      <button class="btn btn-primary open-h2h" data-match-id="${upcoming.id}">
        Full Analysis & Head-to-Head →
      </button>
    </div>`;

    container.querySelector('.open-h2h')?.addEventListener('click', () => {
        openH2HModal(upcoming);
    });
}

async function init() {
    initModal();

    const analysisContainer = document.getElementById('analysis-container');
    const highlightContainer = document.getElementById('highlight-container');
    const filterBtns = document.querySelectorAll('.analysis-filter-btn');
    let allMatches = [];

    if (analysisContainer) showLoading(analysisContainer);

    try {
        const [matches, teams] = await Promise.all([
            fetchJSON('data/matches.json'),
            fetchJSON('data/teams.json')
        ]);

        allMatches = matches;
        teamData = teams;

        if (highlightContainer) {
            renderUpcomingHighlight(allMatches, highlightContainer);
        }

        if (analysisContainer) {
            renderAnalysisCards(allMatches, analysisContainer, 'all');
        }

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => {
                    b.classList.remove('active');
                    b.setAttribute('aria-pressed', 'false');
                });
                btn.classList.add('active');
                btn.setAttribute('aria-pressed', 'true');
                const filter = btn.dataset.filter || 'all';
                if (analysisContainer) renderAnalysisCards(allMatches, analysisContainer, filter);
            });
        });

    } catch (error) {
        console.error('EuroStats error:', error);
        if (analysisContainer) showError(analysisContainer, error.message);
    }
}

document.addEventListener('DOMContentLoaded', init);

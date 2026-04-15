import { formatDate, buildTeamBadge, showLoading, showError } from './utils.js';
import { getFavorites, toggleFavorite, isFavorite } from './storage.js';
import { initModal, openModal } from './modal.js';

const hamburger = document.getElementById('hamburger');
const mainNav = document.getElementById('main-nav');

if (hamburger && mainNav) {
    hamburger.addEventListener('click', () => {
        mainNav.classList.toggle('open');
        hamburger.classList.toggle('active');
    });
}

let allMatches = [];
let allTeams = [];

async function fetchJSON(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
}
function renderMatches(matches, container) {
    if (!matches || matches.length === 0) {
        container.innerHTML = '<p>No matches available.</p>';
        return;
    }

    const html = matches.map(match => {
        const isFinished = match.status === 'finished';
        const scoreOrTime = isFinished
            ? `<div class="match-score">${match.homeScore} - ${match.awayScore}</div>`
            : `<div class="match-score"><span class="match-score-upcoming">${match.time}</span></div>`;

        return `
        <article class="match-card" data-match-id="${match.id}">
          <div class="match-card-header">
            <span class="match-stage">${match.stage} · ${match.leg}</span>
            <span class="match-status">${isFinished ? 'Full Time' : 'Upcoming'}</span>
          </div>
          <div class="match-card-body">
            <div class="match-teams">
              <div>${buildTeamBadge(match.homeTeamAbbr, '#2C3E50')}<span>${match.homeTeam}</span></div>
              ${scoreOrTime}
              <div>${buildTeamBadge(match.awayTeamAbbr, '#34495E')}<span>${match.awayTeam}</span></div>
            </div>
            <div style="font-size:0.75rem;color:var(--light-text);margin-top:0.5rem">
              ${formatDate(match.date)} · ${match.venue}
            </div>
          </div>
        </article>`;
    }).join('');

    container.innerHTML = html;

    container.querySelectorAll('.match-card').forEach(card => {
        card.addEventListener('click', () => {
            const match = allMatches.find(m => m.id === parseInt(card.dataset.matchId));
            if (match) openMatchModal(match);
        });
    });
}

function openMatchModal(match) {
    const h2h = match.headToHead;
    const content = `
    <div style="display:grid;gap:0.5rem;font-size:0.9rem;margin-bottom:1.5rem">
      <p><strong>Date:</strong> ${formatDate(match.date)}</p>
      <p><strong>Stage:</strong> ${match.stage} — ${match.leg}</p>
      <p><strong>Venue:</strong> ${match.venue}, ${match.city}</p>
      ${match.status === 'finished' ? `<p><strong>Result:</strong> ${match.homeScore} - ${match.awayScore}</p>` : `<p><strong>Time:</strong> ${match.time}</p>`}
      <p><strong>Win Prob:</strong> ${match.homeTeam} ${match.homeWinProb}% | Draw ${match.drawProb}% | ${match.awayTeam} ${match.awayWinProb}%</p>
      <p><strong>Expected Goals:</strong> ${match.expectedHomeGoals} - ${match.expectedAwayGoals}</p>
      <p><strong>H2H Record:</strong> ${match.homeTeam} ${h2h.homeWins}W | Draws ${h2h.draws} | ${match.awayTeam} ${h2h.awayWins}W</p>
      <p><strong>Last Meeting:</strong> ${h2h.lastResult}</p>
    </div>`;

    openModal(`${match.homeTeam} vs ${match.awayTeam}`, content);
}

function renderMiniStandings(teams, container) {
    if (!teams) return;
    const sorted = [...teams].sort((a, b) => b.points - a.points);
    const top5 = sorted.slice(0, 5);
    const html = `<div style="font-size:0.8rem;display:grid;gap:0.3rem">
      <div style="display:grid;grid-template-columns:20px 1fr 30px 30px;padding:0.5rem;background:#2C3E50;color:white;font-weight:bold">
        <span>#</span><span>Team</span><span>P</span><span>Pts</span>
      </div>
      ${top5.map((t, i) => `
      <div style="display:grid;grid-template-columns:20px 1fr 30px 30px;padding:0.4rem;border-bottom:1px solid #ddd">
        <span>${i + 1}</span><span>${t.name}</span><span>${t.played}</span><span style="font-weight:bold;color:#F39C12">${t.points}</span>
      </div>`).join('')}
    </div>`;
    container.innerHTML = html;
}

function updateFavButtons() {
    document.querySelectorAll('.btn-fav[data-team-id]').forEach(btn => {
        const id = parseInt(btn.dataset.teamId, 10);
        const faved = isFavorite(id);
        btn.setAttribute('aria-pressed', String(faved));
        btn.querySelector('.fav-icon').textContent = faved ? '★' : '☆';
        btn.title = faved ? 'Remove from favorites' : 'Add to favorites';
    });
}

function renderFavorites(teams, container) {
    const favIds = getFavorites();
    if (favIds.length === 0) {
        container.innerHTML = `<p>No favorites yet. Go to <a href="stats.html">Standings</a> to follow teams.</p>`;
        return;
    }
    const favTeams = teams.filter(t => favIds.includes(t.id));
    const html = favTeams.map(team => `
    <div style="background:white;border:1px solid #ddd;border-radius:8px;padding:1rem;text-align:center">
      ${buildTeamBadge(team.abbr, team.color, team.textColor)}
      <div style="margin-top:0.5rem;font-weight:bold">${team.name}</div>
      <div style="font-size:0.8rem;color:#777">${team.flag} ${team.country}</div>
      <button class="btn-fav" data-team-id="${team.id}" style="margin-top:0.5rem">
        ${isFavorite(team.id) ? '★ Following' : '☆ Follow'}
      </button>
    </div>`).join('');
    container.innerHTML = html;
    container.querySelectorAll('.btn-fav').forEach(btn => {
        btn.addEventListener('click', () => {
            toggleFavorite(parseInt(btn.dataset.teamId));
            renderFavorites(teams, container);
        });
    });
}

async function init() {
    initModal();

    const matchesContainer = document.getElementById('matches-container');
    const standingsContainer = document.getElementById('mini-standings-container');
    const favoritesContainer = document.getElementById('favorites-container');

    if (matchesContainer) showLoading(matchesContainer);
    if (standingsContainer) showLoading(standingsContainer);

    try {
        const [teams, matches] = await Promise.all([
            fetchJSON('data/teams.json'),
            fetchJSON('data/matches.json')
        ]);

        allTeams = teams;
        allMatches = matches;

        if (matchesContainer) {
            renderMatches(matches, matchesContainer);
        }

        if (standingsContainer) {
            renderMiniStandings(teams, standingsContainer);
        }

        if (favoritesContainer) {
            renderFavorites(teams, favoritesContainer);
        }

        const totalGoals = matches
            .filter(m => m.status === 'finished')
            .reduce((sum, m) => sum + (m.homeScore || 0) + (m.awayScore || 0), 0);

        const el = (id) => document.getElementById(id);

        const totalTeamsEl = el('stat-teams');
        const totalMatchesEl = el('stat-matches');
        const totalGoalsEl = el('stat-goals');
        const totalCountriesEl = el('stat-countries');

        if (totalTeamsEl) totalTeamsEl.textContent = teams.length;
        if (totalMatchesEl) totalMatchesEl.textContent = matches.length;
        if (totalGoalsEl) totalGoalsEl.textContent = totalGoals;

        if (totalCountriesEl) {
            const countries = new Set(teams.map(t => t.country));
            totalCountriesEl.textContent = countries.size;
        }

    } catch (error) {
        console.error('EuroStats error:', error);

        if (matchesContainer) showError(matchesContainer, error.message);
        if (standingsContainer) showError(standingsContainer, error.message);
    }
}

document.addEventListener('DOMContentLoaded', init);

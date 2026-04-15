import { buildTeamBadge, buildFormBadge, getPosClass, showLoading, showError } from './utils.js';
import { getFavorites, toggleFavorite, isFavorite, savePreferences, getPreferences } from './storage.js';
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

let allTeams = [];

async function fetchJSON(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        throw new Error(`Failed to load: ${error.message}`);
    }
}
function renderStandings(teams, tbody) {
    if (!teams || teams.length === 0) {
        tbody.innerHTML = '<tr><td colspan="11" class="no-results">No data available.</td></tr>';
        return;
    }

    const sorted = [...teams].sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        return b.goalsFor - a.goalsFor;
    });

    tbody.innerHTML = sorted.map((team, index) => {
        const pos = index + 1;
        const formHtml = team.form.map(r => buildFormBadge(r)).join('');
        const posClass = getPosClass(team.status);
        const favored = isFavorite(team.id);

        return `<tr>
        <td class="center">
          <span class="pos-number ${posClass}">${pos}</span>
        </td>
        <td>
          <div class="team-cell">
            ${buildTeamBadge(team.abbr, team.color, team.textColor, 'sm')}
            <div class="team-info">
              <span class="team-full-name">${team.name}</span>
              <span class="team-country">${team.flag} ${team.country}</span>
            </div>
          </div>
        </td>
        <td class="center">${team.played}</td>
        <td class="center">${team.won}</td>
        <td class="center">${team.drawn}</td>
        <td class="center">${team.lost}</td>
        <td class="center">${team.goalsFor}</td>
        <td class="center">${team.goalsAgainst}</td>
        <td class="center">${team.goalDifference > 0 ? '+' + team.goalDifference : team.goalDifference}</td>
        <td class="center td-pts">${team.points}</td>
        <td>
          <div class="form-badges">${formHtml}</div>
        </td>
        <td class="center">
          <button class="btn-fav" data-team-id="${team.id}"
            aria-pressed="${favored}"
            title="${favored ? 'Remove from favorites' : 'Add to favorites'}">
            <span class="fav-icon">${favored ? '★' : '☆'}</span>
          </button>
        </td>
      </tr>`;
    }).join('');

    tbody.querySelectorAll('.btn-fav').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.teamId, 10);
            const isNowFav = toggleFavorite(id);
            btn.setAttribute('aria-pressed', String(isNowFav));
            btn.querySelector('.fav-icon').textContent = isNowFav ? '★' : '☆';
            btn.title = isNowFav ? 'Remove from favorites' : 'Add to favorites';
        });
    });

    // Attach row click to open team modal
    tbody.querySelectorAll('tr').forEach((row, idx) => {
        const team = sorted[idx];
        row.style.cursor = 'pointer';
        row.addEventListener('click', (e) => {
            if (e.target.closest('.btn-fav')) return;
            openTeamModal(team, idx + 1);
        });
    });
}

function openTeamModal(team, position) {
    const formHtml = team.form.map(r => buildFormBadge(r)).join(' ');
    const statusLabel = { knockout: '⭐ Knockout Round', group: '✅ Group Phase', eliminated: '❌ Eliminated' }[team.status] || '';

    const content = `
    <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1.5rem;">
      ${buildTeamBadge(team.abbr, team.color, team.textColor)}
      <div>
        <div style="font-size:1.2rem;font-weight:700;font-family:var(--font-sub)">${team.name}</div>
        <div style="font-size:0.8rem;color:var(--light-text)">${team.flag} ${team.country} · ${team.league}</div>
        <div style="font-size:0.8rem;color:var(--gold);font-weight:600;margin-top:3px">${statusLabel}</div>
      </div>
    </div>
    <div class="modal-detail-row">
      <span class="modal-detail-key">Position</span>
      <span class="modal-detail-val">#${position}</span>
    </div>
    <div class="modal-detail-row">
      <span class="modal-detail-key">Points</span>
      <span class="modal-detail-val" style="color:var(--gold);font-size:1.1rem">${team.points}</span>
    </div>
    <div class="modal-detail-row">
      <span class="modal-detail-key">Record (W-D-L)</span>
      <span class="modal-detail-val">
        <span style="color:var(--success)">${team.won}</span> -
        <span style="color:var(--draw)">${team.drawn}</span> -
        <span style="color:var(--danger)">${team.lost}</span>
      </span>
    </div>
    <div class="modal-detail-row">
      <span class="modal-detail-key">Goals Scored</span>
      <span class="modal-detail-val">${team.goalsFor}</span>
    </div>
    <div class="modal-detail-row">
      <span class="modal-detail-key">Goals Conceded</span>
      <span class="modal-detail-val">${team.goalsAgainst}</span>
    </div>
    <div class="modal-detail-row">
      <span class="modal-detail-key">Goal Difference</span>
      <span class="modal-detail-val" style="color:${team.goalDifference >= 0 ? 'var(--success)' : 'var(--danger)'}">
        ${team.goalDifference > 0 ? '+' : ''}${team.goalDifference}
      </span>
    </div>
    <div class="modal-detail-row">
      <span class="modal-detail-key">Stadium</span>
      <span class="modal-detail-val">${team.stadium}</span>
    </div>
    <div class="modal-detail-row">
      <span class="modal-detail-key">Founded</span>
      <span class="modal-detail-val">${team.founded}</span>
    </div>
    <div class="modal-detail-row">
      <span class="modal-detail-key">Top Scorer</span>
      <span class="modal-detail-val">${team.topScorer.name} (${team.topScorer.goals} goals)</span>
    </div>
    <div class="modal-detail-row">
      <span class="modal-detail-key">Recent Form</span>
      <span class="modal-detail-val"><div class="form-badges">${formHtml}</div></span>
    </div>
    <div class="modal-detail-row">
      <span class="modal-detail-key">Attack Rating</span>
      <span class="modal-detail-val">${team.attackStrength.toFixed(1)} / 10</span>
    </div>
    <div class="modal-detail-row">
      <span class="modal-detail-key">Defense Rating</span>
      <span class="modal-detail-val">${team.defenseStrength.toFixed(1)} / 10</span>
    </div>`;

    openModal(team.name, content);
}


function renderTopScorers(teams, container) {
    const scorers = teams
        .map(t => ({ ...t.topScorer, team: t.name, flag: t.flag, color: t.color, textColor: t.textColor, abbr: t.abbr }))
        .sort((a, b) => b.goals - a.goals)
        .slice(0, 10);

    const rankClass = (i) => i === 0 ? 'top-1' : i === 1 ? 'top-2' : i === 2 ? 'top-3' : '';

    container.innerHTML = scorers.map((s, i) => `
    <div class="scorer-card">
      <span class="scorer-rank ${rankClass(i)}" aria-label="Rank ${i + 1}">${i + 1}</span>
      ${buildTeamBadge(s.abbr, s.color, s.textColor, 'sm')}
      <div class="scorer-info">
        <div class="scorer-name">${s.name}</div>
        <div class="scorer-team">${s.flag} ${s.team}</div>
      </div>
      <div style="text-align:center">
        <span class="scorer-goals">${s.goals}</span>
        <span class="scorer-goals-label">Goals</span>
      </div>
    </div>`).join('');
}

function applyFilters(country, sortBy, tbody) {
    let filtered = [...allTeams];

    if (country && country !== 'all') {
        filtered = filtered.filter(t => t.country === country);
    }

    if (sortBy === 'goals') {
        filtered.sort((a, b) => b.goalsFor - a.goalsFor);
    } else if (sortBy === 'attack') {
        filtered.sort((a, b) => b.attackStrength - a.attackStrength);
    } else if (sortBy === 'defense') {
        filtered.sort((a, b) => b.defenseStrength - a.defenseStrength);
    } else {
        filtered.sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            return b.goalDifference - a.goalDifference;
        });
    }

    renderStandings(filtered, tbody);
    savePreferences({ filterCountry: country, sortBy });
}

function buildCountryFilter(teams) {
    const countries = [...new Set(teams.map(t => t.country))].sort();
    return countries;
}

// ── Init ────────────────────────────────────────────────────

async function init() {
    initModal();

    const tableWrapper = document.querySelector('.table-wrapper');
    const scorersContainer = document.getElementById('scorers-container');
    const filterCountry = document.getElementById('filter-country');
    const filterSort = document.getElementById('filter-sort');
    const filterSearch = document.getElementById('filter-search');
    let tableBody = document.querySelector('#standings-table tbody');

    if (tableBody) {
        tableBody.innerHTML = `<tr><td colspan="12" style="padding:2rem;text-align:center;color:var(--light-text);font-family:var(--font-sub)"><div class="spinner" style="margin:0 auto 0.75rem"></div>Loading standings…</td></tr>`;
    }
    if (scorersContainer) showLoading(scorersContainer);

    try {
        allTeams = await fetchJSON('data/teams.json');

        if (filterCountry) {
            const countries = buildCountryFilter(allTeams);
            filterCountry.innerHTML = `<option value="all">All Countries</option>` +
                countries.map(c => `<option value="${c}">${c}</option>`).join('');

            const prefs = getPreferences();
            if (prefs.filterCountry && prefs.filterCountry !== 'all') {
                filterCountry.value = prefs.filterCountry;
            }
        }

        tableBody = document.querySelector('#standings-table tbody');
        if (tableBody) {
            renderStandings(allTeams, tableBody);
        }

        if (scorersContainer) {
            renderTopScorers(allTeams, scorersContainer);
        }

        const runFilters = () => {
            const country = filterCountry ? filterCountry.value : 'all';
            const sortBy = filterSort ? filterSort.value : 'points';
            if (tableBody) applyFilters(country, sortBy, tableBody);
        };

        filterCountry?.addEventListener('change', runFilters);
        filterSort?.addEventListener('change', runFilters);

        filterSearch?.addEventListener('input', () => {
            const query = filterSearch.value.trim().toLowerCase();
            const filtered = allTeams.filter(t =>
                t.name.toLowerCase().includes(query) ||
                t.country.toLowerCase().includes(query) ||
                t.abbr.toLowerCase().includes(query)
            );
            if (tableBody) renderStandings(filtered, tableBody);
        });

    } catch (error) {
        console.error('EuroStats error:', error);
        const tbody = document.querySelector('#standings-table tbody');
        if (tbody) tbody.innerHTML = `<tr><td colspan="12"><div class="error-msg" role="alert">⚠️ ${error.message}<br>Please try visiting the site from a web server (not file://).</div></td></tr>`;
        if (scorersContainer) showError(scorersContainer, error.message);
    }
}

document.addEventListener('DOMContentLoaded', init);

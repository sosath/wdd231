const FAVORITES_KEY = 'eurostats_favorites';
const PREFS_KEY = 'eurostats_prefs';

export function getFavorites() {
    try {
        const stored = localStorage.getItem(FAVORITES_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

function saveFavorites(favs) {
    try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
    } catch {
        console.log('Could not save to localStorage');
    }
}

export function addFavorite(teamId) {
    const favs = getFavorites();
    if (!favs.includes(teamId)) {
        favs.push(teamId);
        saveFavorites(favs);
    }
}

export function removeFavorite(teamId) {
    const favs = getFavorites().filter(id => id !== teamId);
    saveFavorites(favs);
}

export function toggleFavorite(teamId) {
    if (isFavorite(teamId)) {
        removeFavorite(teamId);
        return false;
    } else {
        addFavorite(teamId);
        return true;
    }
}

export function isFavorite(teamId) {
    return getFavorites().includes(teamId);
}

export function savePreferences(prefs) {
    try {
        const current = getPreferences();
        localStorage.setItem(PREFS_KEY, JSON.stringify({ ...current, ...prefs }));
    } catch {
        console.log('Could not save preferences');
    }
}

export function getPreferences() {
    try {
        const stored = localStorage.getItem(PREFS_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch {
        return {};
    }
}

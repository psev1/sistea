/**
 * SISTEA - Mini State Management
 * État global simple + abonnements
 */

const state = {
    currentPage: 'map',
    currentLayer: 'ndvi',
    selectedSite: null,
    theme: 'light',
    missionRunning: false,
    cmdPayload: 'hd',
    tlProgress: 1,
    tlPlaying: false,
};

const listeners = new Map();

export function getState(key) {
    return key ? state[key] : { ...state };
}

export function setState(partial) {
    const prev = { ...state };
    Object.assign(state, partial);

    // Notifier les abonnés concernés
    Object.keys(partial).forEach(key => {
        if (listeners.has(key)) {
            listeners.get(key).forEach(fn => fn(state[key], prev[key]));
        }
    });

    // Notifier les abonnés globaux
    if (listeners.has('*')) {
        listeners.get('*').forEach(fn => fn(state, prev));
    }
}

export function subscribe(key, callback) {
    if (!listeners.has(key)) listeners.set(key, []);
    listeners.get(key).push(callback);

    // Retourne une fonction de désabonnement
    return () => {
        const arr = listeners.get(key);
        const idx = arr.indexOf(callback);
        if (idx > -1) arr.splice(idx, 1);
    };
}

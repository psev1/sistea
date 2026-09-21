/**
 * SISTEA - Point d'entrée principal
 * Navigation, thème, horloge, initialisation des modules
 */

import { initMap, invalidateMapSize } from './map.js';
import { initCommand } from './command.js';
import { initLive } from './live.js';
import { initAlerts } from './alerts.js';
import { initDataPage } from './data-page.js';
import { initReports } from './reports.js';
import { initSettings } from './settings.js';
import { setState } from './state.js';
import { $ } from './utils.js';

/* ══ HORLOGE ══ */
function updateClock() {
    const n = new Date();
    $('utc-clock').textContent =
        String(n.getUTCHours()).padStart(2, '0') + ':' +
        String(n.getUTCMinutes()).padStart(2, '0') + ':' +
        String(n.getUTCSeconds()).padStart(2, '0') + ' UTC';
}

/* ══ THÈME ══ */
function toggleTheme() {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    const btn = $('theme-btn');
    btn.textContent = isDark ? '☀' : '☾';
    btn.setAttribute('aria-label', isDark ? 'Passer en thème clair' : 'Passer en thème sombre');
    setState({ theme: isDark ? 'dark' : 'light' });
    setTimeout(() => invalidateMapSize(), 60);
}

/* ══ NAVIGATION ══ */
function showPage(id, el) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    $('pg-' + id).classList.add('active');
    document.querySelectorAll('.sb-nav').forEach(n => {
        n.classList.remove('active');
        n.removeAttribute('aria-current');
    });
    el.classList.add('active');
    el.setAttribute('aria-current', 'page');
    $('layer-pills-wrap').style.display = id === 'map' ? 'flex' : 'none';
    setState({ currentPage: id });
    if (id === 'map') setTimeout(() => invalidateMapSize(), 60);
    if (id === 'live' && typeof window.invalidateLiveMap === 'function') {
        setTimeout(() => window.invalidateLiveMap(), 60);
    }
}

/* ══ INITIALISATION ══ */
function init() {
    // Horloge
    setInterval(updateClock, 1000);
    updateClock();

    // Modules
    initMap();
    initCommand();
    initLive();
    initAlerts();
    initDataPage();
    initReports();
    initSettings();

    // Recalcul carte au redimensionnement (responsive)
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => invalidateMapSize(), 120);
    });

    // Exposer les fonctions utilisées dans le HTML (onclick)
    window.showPage = showPage;
    window.toggleTheme = toggleTheme;
}

// Démarrage
document.addEventListener('DOMContentLoaded', init);

/**
 * SISTEA - Module Carte
 * Leaflet, couches, markers, widgets, timeline
 */

import { SITES, SENSORS, LAYERS, CAT, PRIO } from './data.js';
import { priorityCol, priorityBg, priorityCls, $ } from './utils.js';
import { getState, setState } from './state.js';

let map = null;
let tileLayer = null;
const wsMarkers = {};
const zoneLayers = {}; // polygones de délimitation par site

function zoneStyle(prio, selected = false) {
    const col = priorityCol(prio);
    return {
        color: col,
        weight: selected ? 3.5 : 2,
        opacity: selected ? 1 : 0.8,
        fillColor: col,
        fillOpacity: selected ? 0.32 : 0.18,
        dashArray: selected ? null : '5 4',
        lineJoin: 'round',
        lineCap: 'round'
    };
}

/** Contour de zone : polygone réel si défini, sinon rien */
function getZoneCoords(site) {
    if (site.poly && site.poly.length >= 3) {
        // Fermer le polygone si besoin
        const coords = site.poly.map(p => [p[0], p[1]]);
        const first = coords[0];
        const last = coords[coords.length - 1];
        if (first[0] !== last[0] || first[1] !== last[1]) {
            coords.push([first[0], first[1]]);
        }
        return coords;
    }
    return null;
}

/* ── Initialisation carte ── */
export function initMap() {
    map = L.map('map', {
        center: [7.1, -5.9],
        zoom: 7,
        zoomControl: true,
        attributionControl: false
    });

    const cfg = LAYERS.ndvi;
    tileLayer = L.tileLayer(cfg.url, { maxZoom: 18 }).addTo(map);
    map.zoomControl.setPosition('bottomright');

    setTimeout(() => applyLayerFilter('ndvi'), 400);

    // Délimitations réalistes + markers (couvre plusieurs villes par zone)
    SITES.forEach((s, i) => {
        const col = priorityCol(s.prio);
        const bg  = priorityBg(s.prio);
        const polyCoords = getZoneCoords(s);
        const citiesLine = s.cities
            ? `<div class="popup-row"><span class="popup-key">Localités</span><span class="popup-v">${s.cities}</span></div>`
            : '';

        const popupHtml = `
            <div class="popup-inner">
              <div class="popup-header">
                <div class="popup-ic" style="background:${bg};color:${col}">${CAT[s.cat].ic}</div>
                <div>
                  <div class="popup-name">${s.name}</div>
                  <div class="popup-stat" style="color:${col}">${PRIO[s.prio].label} · ${CAT[s.cat].label}</div>
                </div>
              </div>
              ${citiesLine}
              <div class="popup-row"><span class="popup-key">Superficie touchée</span><span class="popup-v">${s.superficie} ha</span></div>
              <div class="popup-row"><span class="popup-key">${s.detail}</span><span class="popup-v ${priorityCls(s.prio)}">${s.dval}</span></div>
              <div class="popup-row"><span class="popup-key">Confiance IA</span><span class="popup-v tel">${s.conf}%</span></div>
              <div class="popup-row"><span class="popup-key">Détection</span><span class="popup-v">${s.date}</span></div>
              <div class="popup-coords">${s.ll[0].toFixed(4)}°N, ${Math.abs(s.ll[1]).toFixed(4)}°O</div>
            </div>`;

        if (polyCoords) {
            const zone = L.polygon(polyCoords, zoneStyle(s.prio, false))
                .addTo(map)
                .bindPopup(popupHtml, { maxWidth: 260, className: 'mwp' });
            zone.on('click', () => selectSite(s));
            zoneLayers[s.name] = zone;
        }

        const icon = L.divIcon({
            html: `<div class="mk-wrap">
                     <div class="mk-ring" style="border-color:${col};--dur:${2 + i * 0.3}s"></div>
                     <div class="mk-core" style="background:${bg};color:${col}">${CAT[s.cat].ic}</div>
                   </div>`,
            className: '',
            iconSize: [38, 38],
            iconAnchor: [19, 19],
            popupAnchor: [0, -20]
        });

        const m = L.marker(s.ll, { icon }).addTo(map)
            .bindPopup(popupHtml, { maxWidth: 260, className: 'mwp' });
        m.on('click', () => selectSite(s));
        wsMarkers[s.name] = m;
    });

    // Widgets init
    selectSite(SITES[1]);
    renderPriorityWidget();
    renderZonesWidget();
    renderSensorsPanel();
    renderAlertsPanel();
    updateCriticalBadge();
    initLayerLegend('ndvi');
    initTimeline();

    return map;
}

/* ── Sélection d’un site ── */
export function selectSite(s) {
    setState({ selectedSite: s });
    const col = priorityCol(s.prio);
    const bg  = priorityBg(s.prio);

    // Mettre en avant la zone sélectionnée, atténuer les autres
    Object.keys(zoneLayers).forEach(name => {
        const layer = zoneLayers[name];
        const site = SITES.find(x => x.name === name);
        if (!site || !layer) return;
        const selected = name === s.name;
        layer.setStyle(zoneStyle(site.prio, selected));
        if (selected) layer.bringToFront();
    });

    $('ws-tag').style.background = bg;
    $('ws-tag').style.color = col;
    $('ws-tag').textContent = PRIO[s.prio].label;
    $('ws-site').textContent = s.name;
    $('ws-sub').textContent = CAT[s.cat].label + ' · ' + s.date;
    $('ws-p1').textContent = s.seuil + '%';
    $('ws-bar1').style.width = s.seuil + '%';
    $('ws-p2').textContent = s.conf + '%';
    $('ws-bar2').style.width = s.conf + '%';
}


/**
 * Simple highlight on alert map (no editing - editing is on Command mission map).
 */
export function focusMissionZone(site) {
    if (!map || !site) return;
    selectSite(site);
    const layer = zoneLayers[site.name];
    if (layer) {
        try {
            map.fitBounds(layer.getBounds(), { padding: [36, 36], maxZoom: 12 });
        } catch (e) {
            map.setView(site.ll, 11);
        }
    } else {
        map.setView(site.ll, 11);
    }
    setTimeout(() => { if (map) map.invalidateSize(); }, 80);
}

window.focusMissionZone = focusMissionZone;

/* ── Widget alerte prioritaire ── */
function renderPriorityWidget() {
    const top = [...SITES]
        .sort((a, b) => b.superficie - a.superficie)
        .find(s => s.prio === 'critique') || SITES[0];

    $('wc-title').textContent = 'Alerte prioritaire';
    $('wc-val').textContent = top.superficie + ' ha';
    $('wc-sub').textContent = CAT[top.cat].label.toLowerCase() + ' - ' + PRIO[top.prio].label.toLowerCase();
    $('wc-zone').textContent = top.name.split(' - ')[0].split(' de ').pop();
    $('wc-prio').textContent = PRIO[top.prio].label;
    $('wc-prio').className = 'wc-val ' + priorityCls(top.prio);
    $('wc-conf').textContent = top.conf + '%';
    $('wc-bar').style.width = top.seuil + '%';
    $('wc-bar').style.background = 'linear-gradient(90deg,#fbbf24,#f97316,#ef4444)';
}

/* ── Widget zones détectées ── */
function renderZonesWidget() {
    const numEl = document.querySelector('.wo-num');
    if (numEl) numEl.textContent = String(SITES.length);

    const html = [...SITES]
        .sort((a, b) => (a.prio === 'critique' ? 0 : a.prio === 'elevee' ? 1 : 2) -
                        (b.prio === 'critique' ? 0 : b.prio === 'elevee' ? 1 : 2))
        .slice(0, 6)
        .map(s => {
            const short = s.name.split(' - ')[0].replace(/^Forêt classée de |^Plaine agricole de |^Zone pastorale de |^Massif forestier de |^Périphérie agricole de |^Bassin côtier de |^Zone cacaoyère de |^Corridor Est - /, '');
            return `
            <div class="wc-row">
              <span class="wc-key">${short}</span>
              <span class="wc-val ${priorityCls(s.prio)}">${PRIO[s.prio].label}</span>
            </div>`;
        })
        .join('');
    $('wo-list').innerHTML = html;
}

/* ── Panneau droit : capteurs + alertes ── */
function renderSensorsPanel() {
    $('rp-sensors').innerHTML = SENSORS.map(s => `
        <div class="mod-row">
          <div class="mod-name">${s.label}</div>
          <div class="mod-nse">${s.val}${s.unit}</div>
        </div>
        <div class="mod-bar-track">
          <div class="mod-bar-fill" style="width:${s.pct || Math.min(100, s.val * 2)}%"></div>
        </div>
    `).join('');
}

function renderAlertsPanel() {
    const html = [...SITES]
        .sort((a, b) => (a.prio === 'critique' ? 0 : 1) - (b.prio === 'critique' ? 0 : 1))
        .slice(0, 3)
        .map(s => `
            <div class="alert-card ${priorityCls(s.prio)}">
              <div class="ac-top">
                <div class="ac-title">${CAT[s.cat].label} - ${s.name.split(' - ')[0].split(' de ').pop()}</div>
                <div class="ac-time">${s.date.slice(0, 5)}</div>
              </div>
              <div class="ac-val ${priorityCls(s.prio)}">${s.superficie} ha</div>
            </div>
        `).join('');
    $('rp-alerts').innerHTML = html;
}

function updateCriticalBadge() {
    const count = SITES.filter(s => s.prio === 'critique').length;
    $('badge-crit').innerHTML = `<div class="badge-dot"></div>${count} alertes critiques`;
}

/* ── Couches ── */
function applyLayerFilter(key) {
    const cfg = LAYERS[key];
    const tp = document.querySelector('.leaflet-tile-pane');
    if (tp) {
        tp.style.transition = 'filter 0.45s ease, opacity 0.35s ease';
        tp.style.filter = cfg.filter;
    }
    // Classe utilitaire sur le conteneur carte pour styles optionnels
    const mapEl = $('map');
    if (mapEl) {
        mapEl.classList.remove('layer-rgb', 'layer-ndvi', 'layer-swir', 'layer-therm');
        mapEl.classList.add('layer-' + key);
    }
}

function initLayerLegend(key) {
    const cfg = LAYERS[key];
    $('wl-name').textContent = cfg.name;
    $('wl-sub').textContent = cfg.sub;
    $('wl-grad').style.background = `linear-gradient(90deg,${cfg.grad.join(',')})`;
    $('wl-legend').textContent = cfg.legend;

    const minEl = $('wl-min');
    const maxEl = $('wl-max');
    if (minEl) minEl.textContent = cfg.minLabel || '';
    if (maxEl) maxEl.textContent = cfg.maxLabel || '';
}

export function switchLayer(key, el) {
    document.querySelectorAll('.lpill').forEach(p => {
        const on = el ? p === el : p.dataset.layer === key;
        p.classList.toggle('active', on);
        p.setAttribute('aria-pressed', on ? 'true' : 'false');
    });

    setState({ currentLayer: key });
    const cfg = LAYERS[key];

    // Légende immédiate pour feedback UX
    initLayerLegend(key);

    // Transition douce : fade out → swap tile → fade in + filter
    const tp = document.querySelector('.leaflet-tile-pane');
    if (tp) {
        tp.style.transition = 'opacity 0.25s ease';
        tp.style.opacity = '0.35';
    }

    // Même source d’imagerie pour toutes les couches → pas de rechargement brutal
    // On ne change l’URL que si elle diffère vraiment
    const currentUrl = tileLayer && tileLayer._url;
    if (!tileLayer || currentUrl !== cfg.url) {
        if (tileLayer) map.removeLayer(tileLayer);
        const opts = { maxZoom: 18, opacity: 1 };
        if (cfg.subdomains) opts.subdomains = cfg.subdomains;
        tileLayer = L.tileLayer(cfg.url, opts).addTo(map);
        tileLayer.once('load', () => {
            applyLayerFilter(key);
            if (tp) tp.style.opacity = '1';
        });
    } else {
        // Même tuiles : on applique juste le nouveau traitement spectral
        setTimeout(() => {
            applyLayerFilter(key);
            if (tp) tp.style.opacity = '1';
        }, 80);
    }
}

/* ── Timeline ── */
const months = ['JANV.', 'FÉVR.', 'MARS', 'AVR.', 'MAI', 'JUIN', 'JUIL.', 'AOÛT', 'SEPT.', 'OCT.', 'NOV.', 'DÉC.'];
let tlTimer = null;

function tlUpdate() {
    const progress = getState('tlProgress');
    $('tl-fill').style.width = (progress * 100) + '%';
    $('tl-thumb').style.left = (progress * 100) + '%';
    const mi = Math.floor(progress * 80);
    $('tl-date').textContent = months[mi % 12] + ' ' + (2020 + Math.floor(mi / 12));
}

export function togglePlay() {
    const playing = !getState('tlPlaying');
    setState({ tlPlaying: playing });
    $('tl-play').textContent = playing ? '⏸' : '▶';

    if (playing) {
        tlTimer = setInterval(() => {
            let p = getState('tlProgress') + 0.004;
            if (p >= 1) p = 0;
            setState({ tlProgress: p });
            tlUpdate();
        }, 80);
    } else {
        clearInterval(tlTimer);
    }
}

export function trackClick(e) {
    const r = $('tl-track').getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    setState({ tlProgress: progress });
    tlUpdate();
}

function initTimeline() {
    tlUpdate();
}

/* ── Exposé pour invalidateSize ── */
export function invalidateMapSize() {
    if (map) map.invalidateSize();
}

// Exposer globalement pour les onclick du HTML
window.switchLayer = switchLayer;
window.togglePlay = togglePlay;
window.trackClick = trackClick;

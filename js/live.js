/**
 * SISTEA - Module Drone Live (page integree)
 * Vue satellite reelle de la zone d'alerte (Cote d'Ivoire)
 */

import { $ } from './utils.js';
import { setState } from './state.js';

const MODE_LABELS = {
    hd: 'HD · satellite optique · zone mission',
    ir: 'IR · filtre thermique · zone mission',
    ndvi: 'NDVI · vegetation · zone mission',
    lidar: 'LiDAR · relief · zone mission'
};

const MODE_FILTERS = {
    hd: 'contrast(1.12) saturate(1.15) brightness(1.05)',
    ir: 'sepia(0.3) hue-rotate(310deg) saturate(2) brightness(0.98) contrast(1.2)',
    ndvi: 'hue-rotate(72deg) saturate(2.1) contrast(1.45) brightness(1.05)',
    lidar: 'grayscale(0.85) contrast(1.4) brightness(1.1)'
};

const SAT_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

let mode = 'hd';
let running = false;
let raf = null;
let telTimer = null;
let logTimer = null;
let t0 = 0;

let liveMap = null;
let liveTile = null;
let liveMarker = null;
let liveCircle = null;

let bat = 87, alt = 42, spd = 12.4, sig = -58, tmp = 31, sat = 14;
let lat = 6.82, lon = -5.28;

export function initLive() {
    const gotoCmd = $('live-goto-cmd');
    if (gotoCmd) {
        gotoCmd.addEventListener('click', () => {
            const nav = document.querySelector('.sb-nav[aria-label="Centre de commande"]');
            if (nav && typeof window.showPage === 'function') window.showPage('command', nav);
        });
    }

    const stopBtn = $('live-stop-btn');
    if (stopBtn) {
        stopBtn.addEventListener('click', () => {
            stopLiveSession(true);
            liveLog('Flux arrete manuellement.');
        });
    }

    document.querySelectorAll('.live-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.live-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            mode = tab.dataset.mode;
            $('live-mode-lbl').textContent = MODE_LABELS[mode];
            applyModeFilter();
            if (running) liveLog('Capteur: ' + mode.toUpperCase());
        });
    });

    $('live-conn').addEventListener('click', e => {
        const btn = e.target.closest('.live-conn-btn');
        if (!btn) return;
        document.querySelectorAll('.live-conn-btn').forEach(b => {
            b.classList.remove('active');
            b.querySelector('span').textContent = 'Dispo';
        });
        btn.classList.add('active');
        btn.querySelector('span').textContent = 'Actif';
        if (running) liveLog('Liaison: ' + btn.dataset.conn.toUpperCase());
    });

    setIdleUI();
}

function ensureMap() {
    if (liveMap || typeof L === 'undefined') return;
    const el = $('live-map');
    if (!el) return;

    liveMap = L.map(el, {
        zoomControl: true,
        attributionControl: true
    }).setView([7.5, -5.5], 7);

    liveTile = L.tileLayer(SAT_URL, {
        maxZoom: 18,
        attribution: 'Esri World Imagery'
    }).addTo(liveMap);

    applyModeFilter();
}

function applyModeFilter() {
    const pane = document.querySelector('#live-map .leaflet-tile-pane');
    if (pane) {
        pane.style.filter = MODE_FILTERS[mode] || MODE_FILTERS.hd;
        pane.style.transition = 'filter 0.35s ease';
    }
}

function focusZone(latlng, zoneName) {
    ensureMap();
    if (!liveMap) return;

    if (liveMarker) liveMap.removeLayer(liveMarker);
    if (liveCircle) liveMap.removeLayer(liveCircle);

    liveMap.setView(latlng, 13);

    liveCircle = L.circle(latlng, {
        radius: 2800,
        color: '#ef4444',
        weight: 2,
        fillColor: '#ef4444',
        fillOpacity: 0.12,
        dashArray: '6 4'
    }).addTo(liveMap);

    liveMarker = L.circleMarker(latlng, {
        radius: 8,
        color: '#fff',
        weight: 2,
        fillColor: '#ef4444',
        fillOpacity: 1
    }).addTo(liveMap).bindTooltip(zoneName || 'Zone mission', { permanent: false });

    setTimeout(() => {
        liveMap.invalidateSize();
        applyModeFilter();
    }, 80);
}

export function startLiveSession({ drone, zone, payload, lat: siteLat, lng: siteLng }) {
    stopLiveSession(false);

    lat = typeof siteLat === 'number' ? siteLat : 6.82;
    lon = typeof siteLng === 'number' ? siteLng : -5.28;

    $('live-drone').textContent = drone;
    $('live-zone').textContent = zone;
    $('live-payload').textContent = payload;
    $('live-status').innerHTML = '<span class="badge-dot"></span>LIVE';
    $('live-status').className = 'badge badge-ok';
    $('live-idle').hidden = true;
    $('live-rec').hidden = false;
    if ($('live-stop-btn')) $('live-stop-btn').hidden = false;

    bat = 87 + Math.random() * 8;
    alt = 35 + Math.random() * 20;
    spd = 8 + Math.random() * 6;
    sig = -55 - Math.random() * 10;
    tmp = 28 + Math.random() * 6;
    sat = 12 + Math.floor(Math.random() * 5);

    $('live-log').innerHTML = '';
    liveLog('Liaison etablie avec ' + drone);
    liveLog('Zone cible: ' + zone);
    liveLog('Position: ' + lat.toFixed(4) + 'N, ' + Math.abs(lon).toFixed(4) + 'W');
    liveLog('Nacelle: ' + payload);
    liveLog('Vue satellite chargee (Cote d\'Ivoire)');

    running = true;
    t0 = performance.now();
    setState({ liveActive: true });

    focusZone([lat, lon], zone);

    const loop = (now) => {
        if (!running) return;
        tickClock(now);
        raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    telTimer = setInterval(updateTelemetry, 800);
    logTimer = setInterval(() => {
        if (!running) return;
        const msgs = [
            'Paquet telemetrie OK',
            'Correction GPS RTK',
            'Tuiles satellite a jour',
            'Heartbeat liaison',
            'Capture geotag enregistree'
        ];
        if (Math.random() > 0.55) liveLog(msgs[Math.floor(Math.random() * msgs.length)]);
    }, 3200);
}

export function stopLiveSession(resetMeta = true) {
    running = false;
    setState({ liveActive: false });
    if (raf) cancelAnimationFrame(raf);
    raf = null;
    if (telTimer) clearInterval(telTimer);
    telTimer = null;
    if (logTimer) clearInterval(logTimer);
    logTimer = null;
    $('live-rec').hidden = true;
    if (resetMeta) setIdleUI();
}

function setIdleUI() {
    $('live-status').innerHTML = '<span class="badge-dot"></span>En attente';
    $('live-status').className = 'badge badge-info';
    $('live-drone').textContent = '-';
    $('live-zone').textContent = '-';
    $('live-payload').textContent = '-';
    $('live-idle').hidden = false;
    if ($('live-stop-btn')) $('live-stop-btn').hidden = true;
    $('live-timer').textContent = '00:00:00';
    ['lt-bat', 'lt-alt', 'lt-spd', 'lt-sig', 'lt-tmp', 'lt-sat'].forEach(id => {
        $(id).textContent = '-';
        $(id).className = 'val';
    });
    $('live-gps').textContent = '-';
    $('live-ov-alt').textContent = 'ALT -';
}

function liveLog(msg) {
    const el = $('live-log');
    if (!el) return;
    const now = new Date();
    const ts = [now.getHours(), now.getMinutes(), now.getSeconds()]
        .map(n => String(n).padStart(2, '0')).join(':');
    el.innerHTML = '<div class="live-log-row"><span class="t">' + ts + '</span>' + msg + '</div>' + el.innerHTML;
}

function tickClock(now) {
    const elapsed = Math.floor((now - t0) / 1000);
    const h = String(Math.floor(elapsed / 3600)).padStart(2, '0');
    const m = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
    const s = String(elapsed % 60).padStart(2, '0');
    $('live-timer').textContent = h + ':' + m + ':' + s;
}

function updateTelemetry() {
    if (!running) return;
    bat = Math.max(12, bat - Math.random() * 0.04);
    alt = Math.max(15, Math.min(120, alt + (Math.random() - 0.5) * 1.8));
    spd = Math.max(0, Math.min(22, spd + (Math.random() - 0.5) * 0.6));
    sig = Math.max(-90, Math.min(-40, sig + (Math.random() - 0.5) * 1.2));
    tmp = Math.max(22, Math.min(48, tmp + (Math.random() - 0.5) * 0.3));
    sat = Math.max(8, Math.min(18, Math.round(sat + (Math.random() - 0.5) * 0.4)));
    // leger deplacement autour de la zone
    lat += (Math.random() - 0.5) * 0.0004;
    lon += (Math.random() - 0.5) * 0.0004;

    const batEl = $('lt-bat');
    batEl.textContent = bat.toFixed(0) + '%';
    batEl.className = 'val ' + (bat > 30 ? 'ok' : bat > 15 ? 'warn' : 'bad');

    $('lt-alt').textContent = alt.toFixed(0) + ' m';
    $('lt-spd').textContent = spd.toFixed(1) + ' m/s';

    const sigEl = $('lt-sig');
    sigEl.textContent = sig.toFixed(0) + ' dBm';
    sigEl.className = 'val ' + (sig > -70 ? 'ok' : sig > -80 ? 'warn' : 'bad');

    $('lt-tmp').textContent = tmp.toFixed(0) + ' °C';
    $('lt-sat').textContent = String(sat);
    $('live-gps').textContent = lat.toFixed(3) + 'N  ' + Math.abs(lon).toFixed(3) + 'W';
    $('live-ov-alt').textContent = 'ALT ' + alt.toFixed(0) + ' m';

    if (liveMarker) {
        liveMarker.setLatLng([lat, lon]);
    }
}

/** Appeler quand on affiche l'onglet Live pour recalculer la taille carte */
export function invalidateLiveMap() {
    if (liveMap) setTimeout(() => liveMap.invalidateSize(), 60);
}

window.startLiveSession = startLiveSession;
window.stopLiveSession = stopLiveSession;
window.invalidateLiveMap = invalidateLiveMap;

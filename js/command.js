/**
 * SISTEA - Module Centre de Commande
 * Carte d'ajustement de zone independante de la carte Alertes
 */

import { SITES, DRONES, CMD_FLOW, DRONE_SPECS, PAYLOADS } from './data.js';
import { $, formatTime } from './utils.js';
import { getState, setState } from './state.js';

let cmdLogEntries = [];

/* ── Carte mission (separee de la carte alertes) ── */
let missionMap = null;
let missionTile = null;
let missionPoly = null;
let missionHandles = [];
let missionBaseCoords = null;

const SAT_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

function openRing(coords) {
    if (coords.length > 1 &&
        coords[0][0] === coords[coords.length - 1][0] &&
        coords[0][1] === coords[coords.length - 1][1]) {
        return coords.slice(0, -1);
    }
    return coords;
}

function cloneCoords(coords) {
    return coords.map(c => [c[0], c[1]]);
}

function polyCentroid(coords) {
    const ring = openRing(coords);
    let lat = 0, lng = 0;
    ring.forEach(([a, b]) => { lat += a; lng += b; });
    return [lat / ring.length, lng / ring.length];
}

function scaleCoords(coords, factor) {
    const [cx, cy] = polyCentroid(coords);
    return openRing(coords).map(([lat, lng]) => [
        cx + (lat - cx) * factor,
        cy + (lng - cy) * factor
    ]);
}

function getSiteCoords(site) {
    if (site.poly && site.poly.length >= 3) {
        const coords = site.poly.map(p => [p[0], p[1]]);
        const first = coords[0];
        const last = coords[coords.length - 1];
        if (first[0] !== last[0] || first[1] !== last[1]) {
            coords.push([first[0], first[1]]);
        }
        return coords;
    }
    const [la, ln] = site.ll;
    const d = 0.08;
    return [
        [la - d, ln - d], [la - d, ln + d],
        [la + d, ln + d], [la + d, ln - d],
        [la - d, ln - d]
    ];
}

function ensureMissionMap() {
    if (missionMap || typeof L === 'undefined') return;
    const el = $('cmd-mission-map');
    if (!el) return;

    missionMap = L.map(el, {
        zoomControl: true,
        attributionControl: false
    }).setView([7.5, -5.5], 7);

    missionTile = L.tileLayer(SAT_URL, { maxZoom: 18 }).addTo(missionMap);
    missionMap.zoomControl.setPosition('bottomright');
}

function clearHandles() {
    missionHandles.forEach(h => {
        if (missionMap) missionMap.removeLayer(h);
    });
    missionHandles = [];
}

function rebuildHandles() {
    clearHandles();
    if (!missionPoly || !missionMap) return;

    const latlngs = missionPoly.getLatLngs()[0];
    const ring = Array.isArray(latlngs[0]) ? latlngs[0] : latlngs;

    ring.forEach((ll, idx) => {
        const icon = L.divIcon({
            className: 'zone-edit-handle',
            html: '<span></span>',
            iconSize: [16, 16],
            iconAnchor: [8, 8]
        });
        const m = L.marker(ll, { icon, draggable: true, zIndexOffset: 1000 }).addTo(missionMap);
        m.on('drag', () => {
            const pos = m.getLatLng();
            const current = missionPoly.getLatLngs()[0];
            const arr = (Array.isArray(current[0]) ? current[0] : current).slice();
            arr[idx] = pos;
            missionPoly.setLatLngs([arr]);
        });
        m.on('dragend', () => {
            const coords = getMissionZoneCoords();
            if (coords) setMissionPolygon(coords, false);
        });
        missionHandles.push(m);
    });
}

function setMissionPolygon(coords, fit) {
    ensureMissionMap();
    if (!missionMap) return;

    const ring = openRing(coords);

    if (missionPoly) {
        missionPoly.setLatLngs([ring]);
    } else {
        missionPoly = L.polygon(ring, {
            color: '#3b5bdb',
            weight: 3,
            opacity: 1,
            fillColor: '#3b5bdb',
            fillOpacity: 0.25
        }).addTo(missionMap);
    }

    rebuildHandles();

    if (fit) {
        try {
            missionMap.fitBounds(missionPoly.getBounds(), { padding: [28, 28], maxZoom: 13 });
        } catch (e) { /* ignore */ }
    }

    setTimeout(() => { if (missionMap) missionMap.invalidateSize(); }, 80);
}

function loadZoneOnMissionMap(site) {
    ensureMissionMap();
    const coords = getSiteCoords(site);
    missionBaseCoords = cloneCoords(coords);
    setMissionPolygon(coords, true);
}

function getMissionZoneCoords() {
    if (!missionPoly) return null;
    const latlngs = missionPoly.getLatLngs()[0];
    const ring = Array.isArray(latlngs[0]) ? latlngs[0] : latlngs;
    const coords = ring.map(ll => [ll.lat, ll.lng]);
    if (coords.length &&
        (coords[0][0] !== coords[coords.length - 1][0] ||
         coords[0][1] !== coords[coords.length - 1][1])) {
        coords.push([coords[0][0], coords[0][1]]);
    }
    return coords;
}

function getMissionZoneCenter() {
    const coords = getMissionZoneCoords();
    if (!coords) return null;
    return polyCentroid(coords);
}

function scaleMissionZoneLocal(factor) {
    const coords = getMissionZoneCoords();
    if (!coords) return;
    const scaled = scaleCoords(coords, factor);
    scaled.push([scaled[0][0], scaled[0][1]]);
    setMissionPolygon(scaled, false);
}

function resetMissionZoneLocal() {
    if (!missionBaseCoords) return;
    setMissionPolygon(cloneCoords(missionBaseCoords), true);
}

/* ── UI Commande ── */

export function initCommand() {
    $('cmd-flow').innerHTML = CMD_FLOW.map((s, i) =>
        `<div class="cmd-flow-step"><span class="cmd-flow-num">${i + 1}</span>${s}</div>` +
        (i < CMD_FLOW.length - 1 ? '<span class="cmd-flow-arrow">→</span>' : '')
    ).join('');

    $('cmd-specs').innerHTML = DRONE_SPECS.map(([k, v]) =>
        `<div class="spec-row"><span class="spec-key">${k}</span><span class="spec-val">${v}</span></div>`
    ).join('');

    $('cmd-zone').innerHTML = SITES.map((s, i) =>
        `<option value="${i}">${s.name}</option>`
    ).join('');

    renderDroneSelect();

    $('cmd-zone').addEventListener('change', onZoneChange);
    $('cmd-drone').addEventListener('change', updateEstimate);
    $('cmd-duration').addEventListener('input', updateEstimate);

    const shrinkBtn = $('cmd-zone-shrink');
    const growBtn = $('cmd-zone-grow');
    const resetBtn = $('cmd-zone-reset');
    if (shrinkBtn) {
        shrinkBtn.addEventListener('click', () => {
            scaleMissionZoneLocal(0.85);
            logMsg('Zone retrecie (-15%) sur la carte mission.');
        });
    }
    if (growBtn) {
        growBtn.addEventListener('click', () => {
            scaleMissionZoneLocal(1.15);
            logMsg('Zone agrandie (+15%) sur la carte mission.');
        });
    }
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            resetMissionZoneLocal();
            logMsg('Zone reinitialisee au contour d\'origine.');
        });
    }

    renderPayloads();
    onZoneChange();
    renderFleet();

    setTimeout(() => {
        ensureMissionMap();
        const site = SITES[$('cmd-zone').value];
        if (site) loadZoneOnMissionMap(site);
    }, 120);

    logMsg('Centre de commande initialise - carte mission separee des alertes.');
}

export function invalidateMissionMap() {
    if (missionMap) setTimeout(() => missionMap.invalidateSize(), 60);
}

function renderDroneSelect() {
    const sel = $('cmd-drone');
    if (!sel) return;
    const current = sel.value;
    sel.innerHTML = DRONES.map((d, i) => {
        const disabled = d.status !== 'dispo' ? 'disabled' : '';
        const label = d.status === 'dispo'
            ? `${d.name} (${d.label})`
            : `${d.name} - ${d.label}`;
        return `<option value="${i}" ${disabled}>${label}</option>`;
    }).join('');

    const availableIdx = DRONES.findIndex(d => d.status === 'dispo');
    if (current !== '' && DRONES[current] && DRONES[current].status === 'dispo') {
        sel.value = current;
    } else if (availableIdx >= 0) {
        sel.value = String(availableIdx);
    }
}

function suggestedDuration(site) {
    return Math.max(10, Math.min(180, Math.round(site.superficie / 15)));
}

function onZoneChange() {
    const site = SITES[$('cmd-zone').value];
    if (!site) return;

    const durInput = $('cmd-duration');
    if (durInput) durInput.value = String(suggestedDuration(site));

    const hint = $('cmd-duration-hint');
    if (hint) {
        hint.textContent = `Zone ${site.superficie} ha · suggestion ${suggestedDuration(site)} min (modifiable)`;
    }

    updateEstimate();
    loadZoneOnMissionMap(site);
}

function updateEstimate() {
    const duration = Math.max(5, parseInt($('cmd-duration').value, 10) || 30);
    const droneIdx = parseInt($('cmd-drone').value, 10);
    const drone = DRONES[droneIdx];

    $('cmd-est-time').textContent = duration + ' min';
    $('cmd-est-drone').textContent = drone
        ? (drone.status === 'dispo' ? drone.name : drone.name + ' (indisponible)')
        : 'Aucun';

    const endEl = $('cmd-est-end');
    if (endEl) {
        const end = new Date(Date.now() + duration * 60 * 1000);
        endEl.textContent = String(end.getHours()).padStart(2, '0') + ':' +
            String(end.getMinutes()).padStart(2, '0');
    }
}

function renderPayloads() {
    const payload = getState('cmdPayload');
    $('cmd-payloads').innerHTML = PAYLOADS.map(p =>
        `<div class="cmd-pload ${p.key === payload ? 'active' : ''}" data-key="${p.key}">${p.label}</div>`
    ).join('');

    $('cmd-payloads').onclick = (e) => {
        const el = e.target.closest('.cmd-pload');
        if (!el) return;
        setState({ cmdPayload: el.dataset.key });
        renderPayloads();
    };

    $('cmd-pload-desc').textContent = PAYLOADS.find(p => p.key === payload).desc;
}

function renderFleet() {
    $('cmd-fleet').innerHTML = DRONES.map(d => `
        <div class="drone-line">
          <div class="dstatus" style="background:${d.col}"></div>
          <div class="drone-name">${d.name}</div>
          <div class="drone-info">${d.label} · ${d.zone}</div>
        </div>
    `).join('');
    renderDroneSelect();
}

function logMsg(text) {
    const time = formatTime();
    cmdLogEntries.push({ time, text });
    const el = $('cmd-log');
    el.innerHTML = cmdLogEntries.map(e =>
        `<div class="cmd-log-row">
           <span class="cmd-log-time">${e.time}</span>
           <span class="cmd-log-text">${e.text}</span>
         </div>`
    ).join('');
    el.scrollTop = el.scrollHeight;
}

export function launchMission() {
    if (getState('missionRunning')) return;

    const site = SITES[$('cmd-zone').value];
    const droneIdx = parseInt($('cmd-drone').value, 10);
    const drone = DRONES[droneIdx];
    const duration = Math.max(5, parseInt($('cmd-duration').value, 10) || 30);

    if (!drone || drone.status !== 'dispo') {
        logMsg('Selectionnez un drone disponible pour lancer la mission.');
        return;
    }

    let missionLat = site.ll[0];
    let missionLng = site.ll[1];
    const center = getMissionZoneCenter();
    if (center) {
        missionLat = center[0];
        missionLng = center[1];
    }

    setState({ missionRunning: true });
    $('cmd-launch-btn').disabled = true;
    $('cmd-progress-wrap').classList.add('show');

    drone.status = 'mission';
    drone.label = 'En mission';
    drone.col = 'var(--te)';
    drone.zone = site.name + ' · ' + duration + ' min';
    renderFleet();

    const payloadLabel = PAYLOADS.find(p => p.key === getState('cmdPayload')).label;
    logMsg(`Mission ${drone.name} sur ${site.name} - ${duration} min - nacelle ${payloadLabel}`);
    logMsg(`Centre zone ajustee: ${missionLat.toFixed(4)}N, ${Math.abs(missionLng).toFixed(4)}W`);

    if (typeof window.startLiveSession === 'function') {
        window.startLiveSession({
            drone: drone.name,
            zone: site.name,
            payload: payloadLabel,
            lat: missionLat,
            lng: missionLng
        });
    }
    const liveNav = document.getElementById('nav-live');
    if (typeof window.showPage === 'function' && liveNav) {
        window.showPage('live', liveNav);
    }
    logMsg('Onglet Drone Live ouvert - vue satellite de la zone.');

    const stepMs = Math.min(2000, Math.max(800, Math.round((duration * 1000) / 5)));
    const steps = [
        { pct: 15,  msg: `Decollage de ${drone.name}` },
        { pct: 40,  msg: `Transit vers ${site.name}` },
        { pct: 65,  msg: 'Survol et capture d\'images georeferencees' },
        { pct: 85,  msg: 'Transmission des donnees vers la plateforme' },
        { pct: 100, msg: `Retour a la base - mission ${duration} min terminee` }
    ];

    let i = 0;
    const timer = setInterval(() => {
        const step = steps[i];
        $('cmd-progress-fill').style.width = step.pct + '%';
        $('cmd-progress-lbl').textContent = step.msg;
        logMsg(step.msg);
        i++;

        if (i >= steps.length) {
            clearInterval(timer);
            setState({ missionRunning: false });
            $('cmd-launch-btn').disabled = false;

            drone.status = 'dispo';
            drone.label = 'Disponible';
            drone.col = 'var(--gr)';
            drone.zone = 'Base - zone pilote · 100%';
            renderFleet();
            updateEstimate();

            logMsg('Mission terminee - flux Live toujours actif (arret manuel possible).');

            setTimeout(() => {
                $('cmd-progress-wrap').classList.remove('show');
                $('cmd-progress-fill').style.width = '0%';
            }, 1800);
        }
    }, stepMs);
}

window.launchMission = launchMission;
window.invalidateMissionMap = invalidateMissionMap;

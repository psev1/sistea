/**
 * SISTEA — Module Centre de Commande
 */

import { SITES, DRONES, CMD_FLOW, DRONE_SPECS, PAYLOADS } from './data.js';
import { $, formatTime } from './utils.js';
import { getState, setState } from './state.js';

let cmdLogEntries = [];

export function initCommand() {
    // Chaîne de surveillance
    $('cmd-flow').innerHTML = CMD_FLOW.map((s, i) =>
        `<div class="cmd-flow-step"><span class="cmd-flow-num">${i + 1}</span>${s}</div>` +
        (i < CMD_FLOW.length - 1 ? '<span class="cmd-flow-arrow">→</span>' : '')
    ).join('');

    // Specs drone
    $('cmd-specs').innerHTML = DRONE_SPECS.map(([k, v]) =>
        `<div class="spec-row"><span class="spec-key">${k}</span><span class="spec-val">${v}</span></div>`
    ).join('');

    // Zones
    $('cmd-zone').innerHTML = SITES.map((s, i) =>
        `<option value="${i}">${s.name}</option>`
    ).join('');

    $('cmd-zone').addEventListener('change', updateEstimate);

    renderPayloads();
    updateEstimate();
    renderFleet();
    logMsg('Centre de commande initialisé — flotte prête.');
}

function renderPayloads() {
    const payload = getState('cmdPayload');
    $('cmd-payloads').innerHTML = PAYLOADS.map(p =>
        `<div class="cmd-pload ${p.key === payload ? 'active' : ''}" data-key="${p.key}">${p.label}</div>`
    ).join('');

    // Délégation d'événements
    $('cmd-payloads').onclick = (e) => {
        const el = e.target.closest('.cmd-pload');
        if (!el) return;
        setState({ cmdPayload: el.dataset.key });
        renderPayloads();
    };

    $('cmd-pload-desc').textContent = PAYLOADS.find(p => p.key === payload).desc;
}

function updateEstimate() {
    const site = SITES[$('cmd-zone').value];
    const minutes = Math.max(4, Math.round(site.superficie / 1000 * 60));
    $('cmd-est-time').textContent = minutes + ' min';
    const available = DRONES.find(d => d.status === 'dispo');
    $('cmd-est-drone').textContent = available ? available.name : 'Aucun disponible';
}

function renderFleet() {
    $('cmd-fleet').innerHTML = DRONES.map(d => `
        <div class="drone-line">
          <div class="dstatus" style="background:${d.col}"></div>
          <div class="drone-name">${d.name}</div>
          <div class="drone-info">${d.label} · ${d.zone}</div>
        </div>
    `).join('');
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
    const drone = DRONES.find(d => d.status === 'dispo');

    if (!drone) {
        logMsg('Aucun drone disponible — mission différée.');
        return;
    }

    setState({ missionRunning: true });
    $('cmd-launch-btn').disabled = true;
    $('cmd-progress-wrap').classList.add('show');

    drone.status = 'mission';
    drone.label = 'En mission';
    drone.col = 'var(--te)';
    drone.zone = site.name + ' · autonomie 71%';
    renderFleet();

    const payloadLabel = PAYLOADS.find(p => p.key === getState('cmdPayload')).label;
    logMsg(`Mission planifiée sur ${site.name} (nacelle ${payloadLabel})`);

    const steps = [
        { pct: 15,  msg: `Décollage de ${drone.name}` },
        { pct: 40,  msg: `Transit vers ${site.name}` },
        { pct: 65,  msg: "Survol et capture d'images géoréférencées" },
        { pct: 85,  msg: 'Transmission des données vers la plateforme' },
        { pct: 100, msg: 'Retour à la base — mission terminée' }
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
            drone.zone = 'Base — zone pilote · 100%';
            renderFleet();
            updateEstimate();

            setTimeout(() => {
                $('cmd-progress-wrap').classList.remove('show');
                $('cmd-progress-fill').style.width = '0%';
            }, 1800);
        }
    }, 1100);
}

// Exposer globalement
window.launchMission = launchMission;

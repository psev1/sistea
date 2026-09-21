/**
 * SISTEA - Module Drone Live (page intégrée)
 */

import { $ } from './utils.js';
import { getState, setState } from './state.js';

const MODE_LABELS = {
    hd: 'HD · 1080p · 30 fps',
    ir: 'IR · thermique · 30 fps',
    ndvi: 'NDVI · multispectral · 15 fps',
    lidar: 'LiDAR · nuage de points · 10 Hz'
};

let mode = 'hd';
let running = false;
let raf = null;
let telTimer = null;
let logTimer = null;
let t0 = 0;
let frame = 0;

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
            liveLog('Flux arrêté manuellement.');
        });
    }

    // Tabs
    document.querySelectorAll('.live-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.live-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            mode = tab.dataset.mode;
            $('live-mode-lbl').textContent = MODE_LABELS[mode];
            if (running) liveLog(`Basculement capteur → ${mode.toUpperCase()}`);
        });
    });

    // Connexion
    $('live-conn').addEventListener('click', e => {
        const btn = e.target.closest('.live-conn-btn');
        if (!btn) return;
        document.querySelectorAll('.live-conn-btn').forEach(b => {
            b.classList.remove('active');
            b.querySelector('span').textContent = 'Dispo';
        });
        btn.classList.add('active');
        btn.querySelector('span').textContent = 'Actif';
        if (running) liveLog(`Liaison basculée → ${btn.dataset.conn.toUpperCase()}`);
    });

    setIdleUI();
}

export function startLiveSession({ drone, zone, payload }) {
    stopLiveSession(false);

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
    lat = 6.5 + Math.random() * 1.2;
    lon = -5.8 + Math.random() * 1.5;

    $('live-log').innerHTML = '';
    liveLog(`Liaison établie avec ${drone}`);
    liveLog(`Zone cible : ${zone}`);
    liveLog(`Nacelle active : ${payload}`);
    liveLog('Flux HD initialisé - bitrate 4.2 Mbps');

    running = true;
    t0 = performance.now();
    frame = 0;
    setState({ liveActive: true });

    const loop = (now) => {
        if (!running) return;
        drawFeed(now);
        tickClock(now);
        raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    telTimer = setInterval(updateTelemetry, 800);
    logTimer = setInterval(() => {
        if (!running) return;
        const msgs = [
            'Paquet télémétrie OK',
            'Correction GPS RTK',
            'Buffer vidéo stable',
            'Heartbeat liaison',
            'Capture géotag enregistrée'
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
    const now = new Date();
    const ts = [now.getHours(), now.getMinutes(), now.getSeconds()]
        .map(n => String(n).padStart(2, '0')).join(':');
    el.innerHTML = `<div class="live-log-row"><span class="t">${ts}</span>${msg}</div>` + el.innerHTML;
}

function tickClock(now) {
    const elapsed = Math.floor((now - t0) / 1000);
    const h = String(Math.floor(elapsed / 3600)).padStart(2, '0');
    const m = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
    const s = String(elapsed % 60).padStart(2, '0');
    $('live-timer').textContent = `${h}:${m}:${s}`;
}

function updateTelemetry() {
    if (!running) return;
    bat = Math.max(12, bat - Math.random() * 0.04);
    alt = Math.max(15, Math.min(120, alt + (Math.random() - 0.5) * 1.8));
    spd = Math.max(0, Math.min(22, spd + (Math.random() - 0.5) * 0.6));
    sig = Math.max(-90, Math.min(-40, sig + (Math.random() - 0.5) * 1.2));
    tmp = Math.max(22, Math.min(48, tmp + (Math.random() - 0.5) * 0.3));
    sat = Math.max(8, Math.min(18, Math.round(sat + (Math.random() - 0.5) * 0.4)));
    lat += (Math.random() - 0.5) * 0.0008;
    lon += (Math.random() - 0.5) * 0.0008;

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
    $('live-gps').textContent = `${lat.toFixed(3)}°N  ${Math.abs(lon).toFixed(3)}°W`;
    $('live-ov-alt').textContent = 'ALT ' + alt.toFixed(0) + ' m';
}

function drawFeed(now) {
    const canvas = $('live-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    const t = (now - t0) / 1000;
    frame++;

    if (mode === 'hd') {
        const g = ctx.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, '#1a3a2a');
        g.addColorStop(0.45, '#2d5a3c');
        g.addColorStop(1, '#0f2418');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
        for (let i = 0; i < 8; i++) {
            const x = ((t * 30 + i * 160) % (w + 200)) - 100;
            const y = 180 + Math.sin(t * 0.4 + i) * 40 + i * 45;
            ctx.fillStyle = `rgba(60,120,70,${0.25 + (i % 3) * 0.08})`;
            ctx.beginPath();
            ctx.ellipse(x, y, 120 + i * 10, 40, 0.2, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.fillStyle = 'rgba(180,210,230,0.08)';
        ctx.fillRect(0, 0, w, h * 0.28);
    } else if (mode === 'ir') {
        const img = ctx.createImageData(w, h);
        for (let y = 0; y < h; y += 3) {
            for (let x = 0; x < w; x += 3) {
                const n = Math.sin(x * 0.02 + t) * Math.cos(y * 0.015 - t * 0.7)
                    + Math.sin((x + y) * 0.01 + t * 0.5);
                const v = (n + 2) / 4;
                let r, g, b;
                if (v < 0.33) { r = 0; g = 0; b = 80 + v * 400; }
                else if (v < 0.55) { r = (v - 0.33) * 800; g = 0; b = 180; }
                else if (v < 0.75) { r = 220; g = (v - 0.55) * 600; b = 40; }
                else { r = 255; g = 180 + (v - 0.75) * 300; b = 0; }
                for (let dy = 0; dy < 3; dy++) for (let dx = 0; dx < 3; dx++) {
                    const i = ((y + dy) * w + (x + dx)) * 4;
                    if (i + 3 < img.data.length) {
                        img.data[i] = r; img.data[i + 1] = g; img.data[i + 2] = b; img.data[i + 3] = 255;
                    }
                }
            }
        }
        ctx.putImageData(img, 0, 0);
    } else if (mode === 'ndvi') {
        ctx.fillStyle = '#1a1208';
        ctx.fillRect(0, 0, w, h);
        for (let i = 0; i < 40; i++) {
            const x = (Math.sin(t * 0.3 + i * 1.7) * 0.5 + 0.5) * w;
            const y = (Math.cos(t * 0.25 + i * 2.1) * 0.5 + 0.5) * h;
            const rad = 30 + (i % 7) * 12;
            const v = 0.2 + (Math.sin(t + i) * 0.5 + 0.5) * 0.7;
            ctx.fillStyle = v < 0.4
                ? `rgba(139,90,43,${0.5 + v})`
                : v < 0.65
                    ? `rgba(180,190,60,${0.45 + v * 0.3})`
                    : `rgba(20,120,40,${0.5 + v * 0.4})`;
            ctx.beginPath();
            ctx.arc(x, y, rad, 0, Math.PI * 2);
            ctx.fill();
        }
    } else {
        ctx.fillStyle = '#05070c';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#5b7cfa';
        for (let i = 0; i < 700; i++) {
            const a = (i * 0.17 + t * 0.4) % (Math.PI * 2);
            const d = (i * 7 + t * 40) % 380;
            const x = w / 2 + Math.cos(a) * d * (0.7 + Math.sin(t + i) * 0.15);
            const y = h / 2 + Math.sin(a) * d * 0.45 + Math.sin(t * 2 + i * 0.1) * 8;
            const s = i % 5 === 0 ? 2.2 : 1;
            ctx.globalAlpha = 0.35 + (i % 10) * 0.05;
            ctx.fillRect(x, y, s, s);
        }
        ctx.globalAlpha = 1;
        ctx.strokeStyle = 'rgba(91,124,250,0.35)';
        ctx.beginPath();
        ctx.moveTo(40, h * 0.72);
        ctx.lineTo(w - 40, h * 0.72);
        ctx.stroke();
    }

    if (frame % 2 === 0) {
        ctx.fillStyle = 'rgba(255,255,255,0.015)';
        for (let y = 0; y < h; y += 3) ctx.fillRect(0, y, w, 1);
    }
}

window.startLiveSession = startLiveSession;
window.stopLiveSession = stopLiveSession;

/**
 * API module — handles all communication with the Django backend.
 */

const API_BASE = 'http://127.0.0.1:8000/api';

const Api = {
    // ── Presets ────────────────────────────
    async getPresets() {
        const res = await fetch(`${API_BASE}/presets/`);
        return res.json();
    },

    async getPreset(id) {
        const res = await fetch(`${API_BASE}/presets/${id}/`);
        return res.json();
    },

    async createPreset(data) {
        const res = await fetch(`${API_BASE}/presets/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return res.json();
    },

    async deletePreset(id) {
        await fetch(`${API_BASE}/presets/${id}/`, { method: 'DELETE' });
    },

    // ── Spinning ───────────────────────────
    async spinPreset(id) {
        const res = await fetch(`${API_BASE}/presets/${id}/spin/`, { method: 'POST' });
        return res.json();
    },

    async quickSpin(items) {
        const res = await fetch(`${API_BASE}/quick-spin/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items }),
        });
        return res.json();
    },

    async numberSpin(min, max) {
        const res = await fetch(`${API_BASE}/number-spin/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ min_value: min, max_value: max }),
        });
        return res.json();
    },

    async yesNoSpin() {
        const res = await fetch(`${API_BASE}/yes-no-spin/`, { method: 'POST' });
        return res.json();
    },

    // ── Defaults ───────────────────────────
    async getDefaults() {
        const res = await fetch(`${API_BASE}/defaults/`);
        return res.json();
    },

    // ── History ────────────────────────────
    async getHistory(presetId) {
        const res = await fetch(`${API_BASE}/presets/${presetId}/history/`);
        return res.json();
    },

    async clearHistory(presetId) {
        await fetch(`${API_BASE}/presets/${presetId}/clear_history/`, { method: 'DELETE' });
    },
};

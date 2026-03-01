import { useState, useEffect } from "react";
import { getHistory, saveHistoryApi, deleteHistoryApi, clearHistoryApi } from "../lib/api";

const STORAGE_KEY = "decision-engine-history";
const MAX_ITEMS = 20;

function loadHistoryLocal() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function persistLocal(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function useHistory() {
    const [history, setHistory] = useState(loadHistoryLocal);

    useEffect(() => {
        const token = localStorage.getItem("de_token");
        if (token) {
            getHistory().then(setHistory).catch(console.error);
        } else {
            persistLocal(history);
        }
    }, [history]);

    const saveAnalysis = async ({ dilemma, age, riskProfile, timeHorizon, data }) => {
        const entry = {
            id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
            dilemma,
            age,
            riskProfile,
            timeHorizon,
            result_data: data, // API mapped name
            data, // Frontend expects this name
            timestamp: new Date().toISOString(),
        };

        setHistory((prev) => [entry, ...prev].slice(0, MAX_ITEMS));

        const token = localStorage.getItem("de_token");
        if (token) {
            try {
                await saveHistoryApi({ dilemma, age, riskProfile, timeHorizon, result_data: data });
            } catch (err) {
                console.error("Failed to sync to DB", err);
            }
        }
        return entry;
    };

    const deleteAnalysis = async (id) => {
        setHistory((prev) => prev.filter((e) => e.id !== id));
        const token = localStorage.getItem("de_token");
        if (token) {
            try { await deleteHistoryApi(id); } catch (e) { }
        }
    };

    const clearHistory = async () => {
        setHistory([]);
        const token = localStorage.getItem("de_token");
        if (token) {
            try { await clearHistoryApi(); } catch (e) { }
        }
    };

    return { history, saveAnalysis, deleteAnalysis, clearHistory };
}

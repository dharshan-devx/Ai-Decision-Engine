import { useState, useEffect } from "react";

const STORAGE_KEY = "decision-engine-history";
const MAX_ITEMS = 20;

function loadHistory() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function persist(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function useHistory() {
    const [history, setHistory] = useState(loadHistory);

    useEffect(() => { persist(history); }, [history]);

    const saveAnalysis = ({ dilemma, age, riskProfile, timeHorizon, data }) => {
        const entry = {
            id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
            dilemma,
            age,
            riskProfile,
            timeHorizon,
            data,
            timestamp: new Date().toISOString(),
        };
        setHistory((prev) => [entry, ...prev].slice(0, MAX_ITEMS));
        return entry;
    };

    const deleteAnalysis = (id) => {
        setHistory((prev) => prev.filter((e) => e.id !== id));
    };

    const clearHistory = () => setHistory([]);

    return { history, saveAnalysis, deleteAnalysis, clearHistory };
}

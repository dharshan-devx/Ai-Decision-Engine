"use client";
export default function HistoryPanel({ history, onSelect, onDelete, onClear, onClose }) {
    return (
        <div className="history-overlay" onClick={onClose}>
            <div className="history-panel" onClick={(e) => e.stopPropagation()}>
                <div className="history-header">
                    <span className="history-title">Analysis History</span>
                    <div className="history-actions">
                        {history.length > 0 && (
                            <button className="history-clear-btn" onClick={onClear}>Clear All</button>
                        )}
                        <button className="history-close-btn" onClick={onClose}>✕</button>
                    </div>
                </div>

                {history.length === 0 ? (
                    <div className="history-empty">
                        <div className="history-empty-icon">📋</div>
                        <div>No analyses yet. Run your first analysis!</div>
                    </div>
                ) : (
                    <div className="history-list">
                        {history.map((entry) => (
                            <div key={entry.id} className="history-item" onClick={() => onSelect(entry)}>
                                <div className="history-item-dilemma">
                                    {entry.dilemma.length > 120 ? entry.dilemma.slice(0, 120) + "…" : entry.dilemma}
                                </div>
                                <div className="history-item-meta">
                                    <span>{new Date(entry.timestamp).toLocaleDateString("en-US", {
                                        month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                                    })}</span>
                                    <span className="history-item-badge">{entry.riskProfile}</span>
                                    <button
                                        className="history-item-delete"
                                        onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }}
                                        title="Delete"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}


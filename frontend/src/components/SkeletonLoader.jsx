"use client";

export default function SkeletonLoader() {
    return (
        <div className="skeleton-container" role="status" aria-label="Loading analysis...">
            {/* Header skeleton */}
            <div className="skeleton-card skeleton-header">
                <div className="skeleton-line skeleton-sm" style={{ width: "120px" }} />
                <div className="skeleton-line skeleton-lg" style={{ width: "80%" }} />
                <div className="skeleton-badges">
                    <div className="skeleton-badge" style={{ width: "80px" }} />
                    <div className="skeleton-badge" style={{ width: "100px" }} />
                    <div className="skeleton-badge" style={{ width: "90px" }} />
                </div>
            </div>

            {/* Section 1 skeleton */}
            <div className="skeleton-section">
                <div className="skeleton-section-header">
                    <div className="skeleton-num" />
                    <div className="skeleton-line" style={{ width: "160px" }} />
                </div>
                <div className="skeleton-card">
                    <div className="skeleton-line" style={{ width: "100%" }} />
                    <div className="skeleton-line" style={{ width: "85%" }} />
                    <div className="skeleton-line" style={{ width: "70%" }} />
                </div>
            </div>

            {/* Section 2 skeleton */}
            <div className="skeleton-section">
                <div className="skeleton-section-header">
                    <div className="skeleton-num" />
                    <div className="skeleton-line" style={{ width: "140px" }} />
                </div>
                <div className="skeleton-cards-grid">
                    <div className="skeleton-card">
                        <div className="skeleton-line skeleton-sm" style={{ width: "80px" }} />
                        <div className="skeleton-line" style={{ width: "100%" }} />
                    </div>
                    <div className="skeleton-card">
                        <div className="skeleton-line skeleton-sm" style={{ width: "100px" }} />
                        <div className="skeleton-line" style={{ width: "90%" }} />
                    </div>
                </div>
            </div>

            {/* Risk bars skeleton */}
            <div className="skeleton-section">
                <div className="skeleton-section-header">
                    <div className="skeleton-num" />
                    <div className="skeleton-line" style={{ width: "130px" }} />
                </div>
                <div className="skeleton-risk-grid">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="skeleton-card">
                            <div className="skeleton-line skeleton-sm" style={{ width: "100px" }} />
                            <div className="skeleton-bar" />
                            <div className="skeleton-line" style={{ width: "60%" }} />
                            <div className="skeleton-line" style={{ width: "100%" }} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Paths skeleton */}
            <div className="skeleton-section">
                <div className="skeleton-section-header">
                    <div className="skeleton-num" />
                    <div className="skeleton-line" style={{ width: "150px" }} />
                </div>
                {[1, 2].map(i => (
                    <div key={i} className="skeleton-card" style={{ marginBottom: "12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <div className="skeleton-line" style={{ width: "200px" }} />
                            <div className="skeleton-badge" style={{ width: "50px" }} />
                        </div>
                        <div className="skeleton-line" style={{ width: "100%", marginTop: "12px" }} />
                        <div className="skeleton-line" style={{ width: "80%" }} />
                    </div>
                ))}
            </div>
        </div>
    );
}

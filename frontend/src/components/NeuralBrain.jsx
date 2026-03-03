"use client";

export default function NeuralBrain({ className = "", style = {}, isLoading = false }) {
    return (
        <div className={`neural-brain-container ${className} ${isLoading ? 'is-loading' : ''}`} style={style}>
            <svg viewBox="0 0 400 400" className="neural-brain-svg" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="coreGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                        <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                    </radialGradient>
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <filter id="coreGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="6" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Orbital Rings - Sophisticated loading indicator */}
                <g className="brain-orbitals" fill="none" stroke="var(--accent)" strokeWidth="0.5" opacity={isLoading ? "0.6" : "0.2"}>
                    <circle cx="200" cy="200" r="160" strokeDasharray="100 200" className="orbital o1" />
                    <circle cx="200" cy="200" r="180" strokeDasharray="150 250" className="orbital o2" />
                </g>

                {/* Background Structure */}
                <g opacity="0.08" stroke="var(--accent)" strokeWidth="0.5" fill="none">
                    <circle cx="200" cy="200" r="140" strokeDasharray="4,8" />
                </g>

                {/* Neural connections (lines) */}
                <g className="neural-connections" stroke="var(--accent)" strokeWidth="1" fill="none" opacity="0.25">
                    <path d="M200 40 L160 80" />
                    <path d="M200 40 L240 80" />
                    <path d="M160 80 L120 100" />
                    <path d="M160 80 L140 140" />
                    <path d="M160 80 L200 120" />
                    <path d="M120 100 L100 160" />
                    <path d="M120 100 L140 140" />
                    <path d="M140 140 L100 160" />
                    <path d="M140 140 L120 200" />
                    <path d="M140 140 L180 180" />
                    <path d="M100 160 L80 220" />
                    <path d="M100 160 L120 200" />
                    <path d="M120 200 L80 220" />
                    <path d="M120 200 L140 260" />
                    <path d="M120 200 L180 180" />
                    <path d="M80 220 L100 280" />
                    <path d="M80 220 L140 260" />
                    <path d="M140 260 L100 280" />
                    <path d="M140 260 L160 320" />
                    <path d="M140 260 L180 280" />
                    <path d="M100 280 L120 330" />
                    <path d="M100 280 L160 320" />
                    <path d="M160 320 L120 330" />
                    <path d="M160 320 L200 360" />
                    <path d="M120 330 L200 360" />
                    <path d="M180 180 L200 120" />
                    <path d="M180 180 L200 240" />
                    <path d="M180 280 L200 240" />
                    <path d="M180 280 L200 360" />
                    <path d="M240 80 L280 100" />
                    <path d="M240 80 L260 140" />
                    <path d="M240 80 L200 120" />
                    <path d="M280 100 L300 160" />
                    <path d="M280 100 L260 140" />
                    <path d="M260 140 L300 160" />
                    <path d="M260 140 L280 200" />
                    <path d="M260 140 L220 180" />
                    <path d="M300 160 L320 220" />
                    <path d="M300 160 L280 200" />
                    <path d="M280 200 L320 220" />
                    <path d="M280 200 L260 260" />
                    <path d="M280 200 L220 180" />
                    <path d="M320 220 L300 280" />
                    <path d="M320 220 L260 260" />
                    <path d="M260 260 L300 280" />
                    <path d="M260 260 L240 320" />
                    <path d="M260 260 L220 280" />
                    <path d="M300 280 L280 330" />
                    <path d="M300 280 L240 320" />
                    <path d="M240 320 L280 330" />
                    <path d="M240 320 L200 360" />
                    <path d="M280 330 L200 360" />
                    <path d="M220 180 L200 120" />
                    <path d="M220 180 L200 240" />
                    <path d="M220 280 L200 240" />
                    <path d="M220 280 L200 360" />
                </g>

                {/* Central "Engine Core" node */}
                <circle
                    cx="200"
                    cy="200"
                    r={isLoading ? "22" : "14"}
                    fill="url(#coreGradient)"
                    filter="url(#coreGlow)"
                    className="neural-core"
                />

                {/* Nodes */}
                <g className="neural-nodes">
                    {[
                        [200, 40], [160, 80], [240, 80], [120, 100], [280, 100],
                        [140, 140], [260, 140], [200, 120], [100, 160], [300, 160],
                        [180, 180], [220, 180], [80, 220], [320, 220], [120, 200], [280, 200],
                        [200, 240], [140, 260], [260, 260], [100, 280], [300, 280],
                        [180, 280], [220, 280], [160, 320], [240, 320], [120, 330], [280, 330],
                        [200, 360]
                    ].map(([cx, cy], i) => (
                        <circle key={i} cx={cx} cy={cy} r="3.5" fill="var(--accent)" opacity={isLoading ? "0.9" : "0.5"} className="neural-node" style={{ animationDelay: `${i * 0.1}s` }} />
                    ))}
                </g>

                {/* Traveling dots */}
                <g className="neural-travelers">
                    {[
                        { path: "M200,40 L160,80 L140,140 L180,180 L200,240 L200,360", dur: isLoading ? "1.8s" : "3s", delay: "0s" },
                        { path: "M200,40 L240,80 L260,140 L220,180 L200,240", dur: isLoading ? "1.5s" : "2.5s", delay: "0.2s" },
                        { path: "M120,100 L100,160 L80,220 L100,280 L160,320 L200,360", dur: isLoading ? "2s" : "3.5s", delay: "0.4s" },
                        { path: "M280,100 L300,160 L320,220 L300,280 L240,320 L200,360", dur: isLoading ? "2s" : "3.5s", delay: "0.6s" },
                        { path: "M200,360 L180,280 L140,260 L120,200 L140,140 L160,80 L200,40", dur: "4s", delay: "0.1s" },
                        { path: "M200,360 L220,280 L260,260 L280,200 L260,140 L240,80 L200,40", dur: "4s", delay: "0.3s" },
                    ].map((t, i) => (
                        <circle key={i} r="3" fill="var(--accent)" filter="url(#glow)">
                            <animateMotion path={t.path} dur={t.dur} begin={t.delay} repeatCount="indefinite" calcMode="linear" />
                        </circle>
                    ))}
                </g>
            </svg>
        </div>
    );
}

"use client";

export default function NeuralBrain() {
    return (
        <div className="neural-brain-container">
            <svg viewBox="0 0 400 400" className="neural-brain-svg" xmlns="http://www.w3.org/2000/svg">
                {/* Neural connections (lines) */}
                <g className="neural-connections" stroke="var(--accent)" strokeWidth="1.2" fill="none" opacity="0.4">
                    {/* Left hemisphere */}
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

                    {/* Right hemisphere */}
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

                    {/* Center spine */}
                    <path d="M200 40 L200 120" />
                    <path d="M200 120 L200 240" />
                    <path d="M200 240 L200 360" />
                </g>

                {/* Glowing active connections */}
                <g className="neural-active-connections" stroke="var(--accent)" strokeWidth="2" fill="none">
                    <path d="M200 40 L160 80 L140 140 L180 180 L200 240 L200 360" className="neural-pulse-path p1" />
                    <path d="M200 40 L240 80 L260 140 L220 180 L200 240" className="neural-pulse-path p2" />
                    <path d="M120 100 L100 160 L80 220 L100 280 L160 320" className="neural-pulse-path p3" />
                    <path d="M280 100 L300 160 L320 220 L300 280 L240 320" className="neural-pulse-path p4" />
                </g>

                {/* Nodes (static) */}
                <g className="neural-nodes">
                    {[
                        [200, 40], [160, 80], [240, 80], [120, 100], [280, 100],
                        [140, 140], [260, 140], [200, 120], [100, 160], [300, 160],
                        [180, 180], [220, 180], [80, 220], [320, 220], [120, 200], [280, 200],
                        [200, 240], [140, 260], [260, 260], [100, 280], [300, 280],
                        [180, 280], [220, 280], [160, 320], [240, 320], [120, 330], [280, 330],
                        [200, 360]
                    ].map(([cx, cy], i) => (
                        <circle
                            key={i}
                            cx={cx}
                            cy={cy}
                            r="4"
                            fill="var(--accent)"
                            opacity="0.6"
                            className="neural-node"
                            style={{ animationDelay: `${i * 0.08}s` }}
                        />
                    ))}
                </g>

                {/* Traveling dots */}
                <g className="neural-travelers">
                    {[
                        { path: "M200,40 L160,80 L140,140 L180,180 L200,240 L200,360", dur: "3s", delay: "0s" },
                        { path: "M200,40 L240,80 L260,140 L220,180 L200,240", dur: "2.5s", delay: "0.5s" },
                        { path: "M120,100 L100,160 L80,220 L100,280 L160,320 L200,360", dur: "3.5s", delay: "1s" },
                        { path: "M280,100 L300,160 L320,220 L300,280 L240,320 L200,360", dur: "3.5s", delay: "1.5s" },
                        { path: "M200,360 L180,280 L140,260 L120,200 L140,140 L160,80 L200,40", dur: "4s", delay: "0.3s" },
                        { path: "M200,360 L220,280 L260,260 L280,200 L260,140 L240,80 L200,40", dur: "4s", delay: "0.8s" },
                        { path: "M80,220 L120,200 L180,180 L220,180 L280,200 L320,220", dur: "2.8s", delay: "0.2s" },
                        { path: "M100,160 L140,140 L200,120 L260,140 L300,160", dur: "2.2s", delay: "1.2s" },
                    ].map((t, i) => (
                        <circle key={i} r="3" fill="var(--accent)" filter="url(#glow)">
                            <animateMotion
                                path={t.path}
                                dur={t.dur}
                                begin={t.delay}
                                repeatCount="indefinite"
                                calcMode="linear"
                            />
                        </circle>
                    ))}
                </g>

                {/* Glow filter */}
                <defs>
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
            </svg>
        </div>
    );
}

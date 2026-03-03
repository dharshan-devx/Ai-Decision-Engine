"use client";
import { useEffect, useState } from "react";

export default function Confetti({ trigger }) {
    const [particles, setParticles] = useState([]);

    useEffect(() => {
        if (!trigger) return;

        const colors = ["#ffa116", "#2cbb5d", "#3b82f6", "#ef4743", "#8b5cf6", "#ffc96b"];
        const newParticles = Array.from({ length: 50 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: -10 - Math.random() * 20,
            color: colors[Math.floor(Math.random() * colors.length)],
            delay: Math.random() * 0.5,
            duration: 1.5 + Math.random() * 1.5,
            size: 4 + Math.random() * 6,
            rotation: Math.random() * 360,
            drift: (Math.random() - 0.5) * 40,
        }));
        setParticles(newParticles);

        const timer = setTimeout(() => setParticles([]), 4000);
        return () => clearTimeout(timer);
    }, [trigger]);

    if (particles.length === 0) return null;

    return (
        <div className="confetti-container" aria-hidden="true">
            {particles.map(p => (
                <div
                    key={p.id}
                    className="confetti-particle"
                    style={{
                        left: `${p.x}%`,
                        background: p.color,
                        width: `${p.size}px`,
                        height: `${p.size * 0.6}px`,
                        animationDelay: `${p.delay}s`,
                        animationDuration: `${p.duration}s`,
                        transform: `rotate(${p.rotation}deg)`,
                        "--drift": `${p.drift}px`,
                    }}
                />
            ))}
        </div>
    );
}

"use client";
import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from "recharts";

export default function PathComparisonChart({ paths }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize(); // Init
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!paths?.length) return null;

  const data = paths.map((p) => ({
    name: p.name,
    probability: p.successProbability,
    reversibility: p.reversibilityScore,
  }));

  const renderXAxisTick = (props) => {
    const { payload, x, y } = props;
    const value = payload.value || "";

    const words = value.split(" ");
    const lines = [];
    let currentLine = words[0];
    const charLimit = isMobile ? 10 : 20;

    for (let i = 1; i < words.length; i++) {
      if ((currentLine + " " + words[i]).length <= charLimit) {
        currentLine += " " + words[i];
      } else {
        lines.push(currentLine);
        currentLine = words[i];
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }

    return (
      <text x={x} y={y + 16} textAnchor="middle" fill="#a8a29e" fontSize={isMobile ? 8 : 12} fontFamily="Inter">
        {lines.map((line, index) => (
          <tspan key={index} x={x} dy={index === 0 ? "0" : "1.2em"}>
            {line}
          </tspan>
        ))}
      </text>
    );
  };

  return (
    <div className="chart-container" style={{ padding: isMobile ? '24px 8px' : '24px' }}>
      <div className="chart-title" style={{ paddingLeft: isMobile ? '8px' : '0' }}>Strategic Path Comparison</div>
      <ResponsiveContainer width="100%" height={360}>
        <BarChart data={data} barCategoryGap="30%" margin={{ top: 20, right: 10, left: -20, bottom: isMobile ? 40 : 20 }}>
          <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="name" tick={renderXAxisTick} axisLine={false} tickLine={false} interval={0} />
          <YAxis tick={{ fill: "#6b6560", fontSize: 10, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} domain={[0, 100]} />
          <Tooltip
            contentStyle={{ background: "rgba(13,13,20,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontFamily: "Inter", fontSize: 12, backdropFilter: "blur(12px)" }}
            cursor={{ fill: "rgba(255,255,255,0.02)" }}
          />
          <Legend wrapperStyle={{ fontSize: 11, fontFamily: "Inter", paddingTop: isMobile ? '20px' : '30px' }} />
          <Bar dataKey="probability" name="Success %" fill="#d4a853" radius={[4, 4, 0, 0]} />
          <Bar dataKey="reversibility" name="Reversibility" fill="#5c9ce6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}


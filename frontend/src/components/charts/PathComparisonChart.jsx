"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

export default function PathComparisonChart({ paths }) {
  if (!paths?.length) return null;

  const data = paths.map((p) => ({
    name: p.name.length > 18 ? p.name.substring(0, 16) + "…" : p.name,
    probability: p.successProbability,
    reversibility: p.reversibilityScore,
  }));

  return (
    <div className="chart-container">
      <div className="chart-title">Strategic Path Comparison</div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: "#a8a29e", fontSize: 10, fontFamily: "Inter" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#6b6560", fontSize: 10, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} domain={[0, 100]} />
          <Tooltip
            contentStyle={{ background: "rgba(13,13,20,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontFamily: "Inter", fontSize: 12, backdropFilter: "blur(12px)" }}
            cursor={{ fill: "rgba(255,255,255,0.02)" }}
          />
          <Bar dataKey="probability" name="Success %" fill="#d4a853" radius={[4, 4, 0, 0]} />
          <Bar dataKey="reversibility" name="Reversibility" fill="#5c9ce6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}


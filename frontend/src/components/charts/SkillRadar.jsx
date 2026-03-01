"use client";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";

export default function SkillRadar({ skillDelta }) {
  if (!skillDelta) return null;
  const requiredSet = new Set(skillDelta.requiredSkills || []);
  const currentSet = new Set(skillDelta.currentSkills || []);
  const allSkills = [...new Set([...requiredSet, ...currentSet])].slice(0, 7);

  const data = allSkills.map((skill) => ({
    skill: skill.length > 16 ? skill.substring(0, 14) + "…" : skill,
    required: requiredSet.has(skill) ? 90 : 20,
    current: currentSet.has(skill) ? 75 : 15,
  }));

  return (
    <div className="chart-container">
      <div className="chart-title">Skill Gap Radar</div>
      <ResponsiveContainer width="100%" height={260}>
        <RadarChart data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.06)" />
          <PolarAngleAxis dataKey="skill" tick={{ fill: "#a8a29e", fontSize: 11, fontFamily: "Inter" }} />
          <Radar name="Required" dataKey="required" stroke="#ef4743" fill="#ef4743" fillOpacity={0.08} />
          <Radar name="Current" dataKey="current" stroke="#2cbb5d" fill="#2cbb5d" fillOpacity={0.12} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}


"use client";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Legend } from "recharts";

export default function SkillRadar({ skillDelta }) {
  if (!skillDelta) return null;
  const requiredSet = new Set(skillDelta.requiredSkills || []);
  const currentSet = new Set(skillDelta.currentSkills || []);
  const allSkills = [...new Set([...requiredSet, ...currentSet])].slice(0, 7);

  const data = allSkills.map((skill) => ({
    skill: skill,
    required: requiredSet.has(skill) ? 90 : 20,
    current: currentSet.has(skill) ? 75 : 15,
  }));

  const renderPolarTick = (props) => {
    const { payload, x, y, textAnchor } = props;
    const value = payload.value || "";

    const words = value.split(" ");
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      if ((currentLine + " " + words[i]).length <= 18) {
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
      <text x={x} y={y} textAnchor={textAnchor} fill="#a8a29e" fontSize={11} fontFamily="Inter">
        {lines.map((line, index) => (
          <tspan key={index} x={x} dy={index === 0 ? `-${(lines.length - 1) * 0.4}em` : "1.2em"}>
            {line}
          </tspan>
        ))}
      </text>
    );
  };

  return (
    <div className="chart-container">
      <div className="chart-title">Skill Gap Radar</div>
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart cx="50%" cy="50%" outerRadius="60%" data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.06)" />
          <PolarAngleAxis dataKey="skill" tick={renderPolarTick} />
          <Radar name="Required" dataKey="required" stroke="#ef4743" fill="#ef4743" fillOpacity={0.08} />
          <Radar name="Current" dataKey="current" stroke="#2cbb5d" fill="#2cbb5d" fillOpacity={0.12} />
          <Legend wrapperStyle={{ fontSize: 11, fontFamily: "Inter", paddingTop: '20px' }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}


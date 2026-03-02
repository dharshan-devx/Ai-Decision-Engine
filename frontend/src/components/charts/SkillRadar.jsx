"use client";
import { useState, useEffect } from "react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Legend } from "recharts";

export default function SkillRadar({ skillDelta }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize(); // Init
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
    const charLimit = isMobile ? 14 : 22;

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

    // Offset y slightly upwards based on number of lines to vertically center the text block
    return (
      <text x={x} y={y} textAnchor={textAnchor} fill="#a8a29e" fontSize={isMobile ? 10 : 11} fontFamily="Inter">
        {lines.map((line, index) => (
          <tspan key={index} x={x} dy={index === 0 ? `-${(lines.length - 1) * 0.5}em` : "1.1em"}>
            {line}
          </tspan>
        ))}
      </text>
    );
  };

  return (
    <div className="chart-container" style={{ padding: isMobile ? '24px 8px' : '24px' }}>
      <div className="chart-title">Skill Gap Radar</div>
      <ResponsiveContainer width="100%" height={380}>
        <RadarChart cx="50%" cy="50%" outerRadius={isMobile ? "55%" : "70%"} data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.06)" />
          <PolarAngleAxis dataKey="skill" tick={renderPolarTick} />
          <Radar name="Required" dataKey="required" stroke="#ef4743" fill="#ef4743" fillOpacity={0.08} />
          <Radar name="Current" dataKey="current" stroke="#2cbb5d" fill="#2cbb5d" fillOpacity={0.12} />
          <Legend wrapperStyle={{ fontSize: 11, fontFamily: "Inter", paddingTop: '10px' }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}




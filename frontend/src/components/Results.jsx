"use client";
import { useState, useCallback } from "react";
import SkillRadar from "./charts/SkillRadar";
import RiskSection from "./sections/RiskSection";
import PathsSection from "./sections/PathsSection";
import DecisionTree from "./DecisionTree";
import HelpIcon from "./HelpIcon";
import CopyButton from "./CopyButton";
import {
  ProbabilisticSection,
  RecommendationsSection,
  BiasSection,
  AntifragilitySection,
} from "./sections/AnalysisSections";

function SectionWrapper({ num, title, tooltip, children, defaultOpen = true, copyText }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="section" style={{ animationDelay: `${0.05 + num * 0.05}s` }}>
      <div className="section-header section-header-interactive" onClick={() => setOpen(!open)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
          <span className="section-num">{String(num).padStart(2, '0')}</span>
          <span className="section-title">{title}</span>
          <HelpIcon small tooltip={tooltip} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {copyText && <span onClick={e => e.stopPropagation()}><CopyButton text={copyText} label={`Copy ${title}`} /></span>}
          <span className={`section-chevron ${open ? 'open' : ''}`}>▼</span>
        </div>
      </div>
      {open && <div className="section-body">{children}</div>}
    </div>
  );
}

export default function Results({ data, dilemma }) {
  const [viewMode, setViewMode] = useState('text');
  if (!data) return null;

  const {
    problemFraming, constraints, riskAnalysis, opportunityCost,
    skillDelta, strategicPaths, probabilisticModel, recommendations,
    biasDetection, antifragilityScore, regretMinimization,
    confidenceScore, confidenceNote,
  } = data;

  return (
    <div className="results">

      {/* Header */}
      <div className="decision-header">
        <div className="decision-label">Decision Analysis</div>
        <div className="decision-title">{problemFraming?.coreDecision || dilemma}</div>
        <div className="decision-meta">
          {problemFraming?.decisionType && (
            <div className="meta-item">
              <span className="meta-label">Type</span>
              <span className="meta-value">{problemFraming.decisionType}</span>
            </div>
          )}
          {problemFraming?.decisionHorizon && (
            <div className="meta-item">
              <span className="meta-label">Horizon</span>
              <span className="meta-value">{problemFraming.decisionHorizon}</span>
            </div>
          )}
          <div className="meta-item">
            <span className="meta-label">Confidence</span>
            <span className="meta-value" style={{ color: "var(--accent)" }}>{confidenceScore}/100</span>
          </div>
        </div>
      </div>

      <div className="view-toggle" style={{ display: 'flex', background: 'var(--surface2)', borderRadius: '12px', padding: '4px', gap: '4px', marginBottom: '32px', width: 'fit-content', border: '1px solid var(--border)' }}>
        <button
          className={`toggle-btn ${viewMode === 'text' ? 'active' : ''}`}
          onClick={() => setViewMode('text')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            background: viewMode === 'text' ? 'var(--accent)' : 'transparent',
            color: viewMode === 'text' ? '#000' : 'var(--text-muted)',
            fontWeight: viewMode === 'text' ? '600' : '500',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: viewMode === 'text' ? 'var(--shadow-sm)' : 'none'
          }}
        >
          Detailed Text Report
        </button>
        <button
          className={`toggle-btn ${viewMode === 'tree' ? 'active' : ''}`}
          onClick={() => setViewMode('tree')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            background: viewMode === 'tree' ? 'var(--accent)' : 'transparent',
            color: viewMode === 'tree' ? '#000' : 'var(--text-muted)',
            fontWeight: viewMode === 'tree' ? '600' : '500',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: viewMode === 'tree' ? 'var(--shadow-sm)' : 'none'
          }}
        >
          Branching Decision Tree
        </button>
      </div>

      {viewMode === 'tree' ? (
        <DecisionTree data={data} />
      ) : (
        <>


          {/* 01 Problem Framing */}
          {problemFraming?.hiddenAssumptions?.length > 0 && (
            <SectionWrapper
              num={1}
              title="Problem Framing"
              tooltip="The core decision and its underlying assumptions."
              copyText={problemFraming.hiddenAssumptions.join('\n')}
            >
              <div className="card">
                <div className="card-label">Hidden Assumptions</div>
                {problemFraming.hiddenAssumptions.map((a, i) => (
                  <div key={i} style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 6, display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{ color: "var(--accent-dim)", fontFamily: "var(--font-mono)", fontSize: 11, marginTop: 2 }}>→</span>
                    <span>{a}</span>
                  </div>
                ))}
              </div>
            </SectionWrapper>
          )}

          {/* 02 Constraints */}
          {constraints && (
            <SectionWrapper
              num={2}
              title="Constraints"
              tooltip="The hard limits and non-negotiables bounding this decision."
              copyText={Object.entries(constraints).map(([k, v]) => `${k}: ${v}`).join('\n')}
            >
              <div className="cards-grid">
                {Object.entries(constraints).map(([k, v]) => (
                  <div key={k} className="card">
                    <div className="card-label">{k.replace(/([A-Z])/g, " $1").trim()}</div>
                    <div className="card-value">{v}</div>
                  </div>
                ))}
              </div>
            </SectionWrapper>
          )}

          {/* 03 Risk */}
          <RiskSection riskAnalysis={riskAnalysis} />

          {/* 04 Opportunity Cost */}
          {opportunityCost && (
            <SectionWrapper
              num={4}
              title="Opportunity Cost"
              tooltip="The value of the alternative paths you give up by making a choice."
              copyText={Object.entries(opportunityCost).map(([k, v]) => `${k}: ${v}`).join('\n')}
            >
              <div className="cards-grid">
                {Object.entries(opportunityCost).map(([k, v]) => (
                  <div key={k} className="card">
                    <div className="card-label">{k.replace(/([A-Z])/g, " $1").trim()}</div>
                    <div className="card-value">{v}</div>
                  </div>
                ))}
              </div>
            </SectionWrapper>
          )}

          {/* 05 Skill Delta */}
          {skillDelta && (
            <div className="section" style={{ animationDelay: '0.3s' }}>
              <div className="section-header">
                <span className="section-num">05</span>
                <span className="section-title">Skill Delta Analysis</span>
                <HelpIcon small tooltip="The gap between your current capabilities and the skills required for success." />
              </div>
              <div className="skill-col">
                <div className="card">
                  <div className="card-label">Required Skills</div>
                  <div className="tag-row" style={{ marginTop: 8 }}>
                    {skillDelta.requiredSkills?.map((s, i) => <span key={i} className="tag required">{s}</span>)}
                  </div>
                  <div style={{ marginTop: 16 }}>
                    <div className="card-label">Current Skills</div>
                    <div className="tag-row" style={{ marginTop: 8 }}>
                      {skillDelta.currentSkills?.map((s, i) => <span key={i} className="tag current">{s}</span>)}
                    </div>
                  </div>
                  <div style={{ marginTop: 20 }}>
                    <div className="gap-label">Gap Score</div>
                    <div className="gap-score-display">
                      <span className="gap-num" style={{
                        color: skillDelta.gapScore > 60 ? "var(--red)" : skillDelta.gapScore > 30 ? "var(--orange)" : "var(--green)"
                      }}>{skillDelta.gapScore}</span>
                      <span className="gap-denom">/100</span>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
                      Est. learning timeline: {skillDelta.learningTimeline}
                    </div>
                  </div>
                </div>
                <SkillRadar skillDelta={skillDelta} />
              </div>
            </div>
          )}

          {/* 06 Strategic Paths */}
          <PathsSection strategicPaths={strategicPaths} />

          {/* 07 Probabilistic */}
          <ProbabilisticSection probabilisticModel={probabilisticModel} />

          {/* 08 Recommendations */}
          <RecommendationsSection recommendations={recommendations} />

          {/* 09 Bias */}
          <BiasSection biasDetection={biasDetection} />

          {/* 10 + 11 Antifragility + Regret */}
          <div className="two-col">
            <AntifragilitySection antifragilityScore={antifragilityScore} />

            {regretMinimization && (
              <div className="section">
                <div className="section-header">
                  <span className="section-num">11</span>
                  <span className="section-title">Regret Minimization</span>
                  <HelpIcon small tooltip="Evaluates the decision from the perspective of your 80-year-old self to minimize future regret." />
                </div>
                <div className="card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <div className="card-label">At-80 Analysis</div>
                    <div className="card-value">{regretMinimization.at80Analysis}</div>
                  </div>
                  <div>
                    <div className="card-label">Primary Regret Risk</div>
                    <div className="card-value" style={{ color: "var(--orange)" }}>{regretMinimization.primaryRegretRisk}</div>
                  </div>
                  <div>
                    <div className="card-label">Recommendation</div>
                    <div className="card-value">{regretMinimization.recommendation}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Confidence Footer */}
          {confidenceNote && (
            <div className="confidence-footer">
              <div className="confidence-badge">
                Confidence {confidenceScore}/100
              </div>
              <div className="confidence-note">{confidenceNote}</div>
            </div>
          )}

        </>
      )}
    </div>
  );
}


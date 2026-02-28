import Header from "./components/Header";
import InputPanel from "./components/InputPanel";
import OutputPanel from "./components/OutputPanel";
import { useDecisionEngine } from "./hooks/useDecisionEngine";

export default function App() {
  const engine = useDecisionEngine();

  return (
    <div className="app">
      <Header />
      <div className="main">
        <InputPanel
          dilemma={engine.dilemma}       setDilemma={engine.setDilemma}
          age={engine.age}               setAge={engine.setAge}
          riskProfile={engine.riskProfile} setRiskProfile={engine.setRiskProfile}
          timeHorizon={engine.timeHorizon} setTimeHorizon={engine.setTimeHorizon}
          loading={engine.loading}
          onAnalyze={engine.handleAnalyze}
        />
        <OutputPanel
          loading={engine.loading}
          loadingStep={engine.loadingStep}
          result={engine.result}
          error={engine.error}
          dilemma={engine.dilemma}
        />
      </div>
    </div>
  );
}

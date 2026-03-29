import { useState } from "react";
import MainLayout from "../layout/MainLayout";
import FlowAgents from "../components/FlowAgents";
import InputPanel from "../components/InputPanel";

function Dashboard() {
  const [inputData, setInputData] = useState(null);

  const handleInput = (data) => {
    console.log("Input recibido:", data);
    setInputData(data);
  };

  return (
    <MainLayout>
      <h1>🤖 AI Multi-Agent System</h1>

      {/* 🔥 AQUÍ APARECE EL INPUT */}
      <InputPanel onSubmit={handleInput} />

      {/* FLOW */}
      <FlowAgents inputData={inputData} />
    </MainLayout>
  );
}

export default Dashboard;
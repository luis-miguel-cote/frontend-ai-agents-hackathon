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
      <div className="page-container">
        <h1 className="page-title">AI Multi-Agent System</h1>
        <InputPanel onSubmit={handleInput} />
        <FlowAgents inputData={inputData} />
      </div>
    </MainLayout>
  );
}

export default Dashboard;
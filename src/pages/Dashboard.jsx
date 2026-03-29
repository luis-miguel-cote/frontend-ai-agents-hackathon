import MainLayout from "../layout/MainLayout";
import FlowAgents from "../components/FlowAgents";

function Dashboard() {
  return (
    <MainLayout>
      <h1>🤖 AI Multi-Agent System</h1>

      <FlowAgents />
    </MainLayout>
  );
}

export default Dashboard;
import MainLayout from "../layout/MainLayout";

function Dashboard() {
  const user = localStorage.getItem("user");

  return (
    <MainLayout>
      <h1>Bienvenido {user}</h1>
      <p>Simulación de equipo de desarrollo con IA</p>
    </MainLayout>
  );
}

export default Dashboard;
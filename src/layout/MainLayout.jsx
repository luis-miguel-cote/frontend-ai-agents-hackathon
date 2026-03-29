import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function MainLayout({ children }) {
  return (
    <div>
      <Navbar />
      <div style={{ padding: "20px" }}>
        {children}
      </div>
      <Footer />
    </div>
  );
}

export default MainLayout;
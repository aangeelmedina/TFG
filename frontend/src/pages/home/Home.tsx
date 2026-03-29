import CentroList from "../../components/Centros/CentrosList/CentroList";
import "./Home.css";

const Home = () => {
  return (
    <div className="home-container">
      <div className="home-heading">
        <h2 className="home-heading__title">Centros sanitarios</h2>
        <p className="home-heading__sub">Gestiona y accede a los centros asignados a tu cuenta</p>
      </div>
      <CentroList />
    </div>
  );
};

export default Home;
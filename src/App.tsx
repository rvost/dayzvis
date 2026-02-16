import {NavLink, Outlet} from "react-router";
import "react-data-grid/lib/styles.css";
import "./App.css";

function App() {
  return (
    <>
      <nav>
        <NavLink to="/">Оружие</NavLink>
        <NavLink to="/ammo">Боеприпасы</NavLink>
        <NavLink to="/chart">График урона</NavLink>
      </nav>
      <main>
        <Outlet />
      </main>
    </>
  );
}

export default App;

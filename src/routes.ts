import {createBrowserRouter} from "react-router";
import App from "./App";
import Weapons from "./views/Weapons";
import Ammo from "./views/Ammo";
import WeaponsChart from "./views/WeaponsChart";
import Weapon, {weaponLoader} from "./views/Weapon";

const router = createBrowserRouter([
  {
    Component: App,
    children: [
      {
        Component: Ammo,
        path: "ammo"
      },
      {
        Component: WeaponsChart,
        path: "chart"
      },
      {
        Component: Weapon,
        path: "weapon/:weaponClass",
        loader: weaponLoader
      },
      {
        Component: Weapons,
        index: true,
        path: "*"
      }
    ]
  }
], {basename: "/dayzvis"});

export default router;

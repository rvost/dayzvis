import Plot from "react-plotly.js";
import ammoData from "../data/ammo.json";
import {bulletDamage} from "../utils";

function transformData() {
  const result = [];
  for (const key in ammoData) {
    const ammo = ammoData[key];
    const projDamage = ammo.damage * (ammo.projectilesCount || 1);
    result.push({
      name: ammo.name,
      damage: bulletDamage(projDamage, ammo.initSpeed, ammo.defaultDamageOverride * ammo.typicalSpeed),
      price: ammo.price || NaN
    });
  }
  return result;
}

function Ammo() {
  const ammo = transformData();
  const x = ammo.map(a => a.damage);
  const y = ammo.map(a => a.price);
  const text = ammo.map(a => a.name);

  return (
    <>
      <Plot
        data={[{type: "scatter", x, y, text, mode: "markers"}]}
        layout={{
          title: {text: "Боеприпасы"},
          autosize: true,
          xaxis: {
            type: "log",
            autorange: true,
            title: {text:"Урон"}
          },
          yaxis: {
            title: {text:"Цена"}
          }
        }}
        useResizeHandler={true}
        style={{width: "100%", height: "100%"}}
      />
    </>
  );
}

export default Ammo;

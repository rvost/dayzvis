import {useMemo} from "react";
import Plot from "react-plotly.js";
import {bulletDamage, clampToSimulationRate, maxBy} from "../utils";
import ammoData from "../data/ammo.json";
import weaponsData from "../data/weapons.json";
import mutantsData from "../data/mutants.json";

function transformData() {
  return weaponsData
    .map(w => {
      const shotsPerS = Math.floor(1 / clampToSimulationRate(w.minReloadTime)) || 1;
      const maxMagazineDepth = Math.max(...w.magazines);
      const availableAmmo = w.chamberableFrom.map(x => ammoData[x]).filter(x => typeof x !== "undefined");
      const a = maxBy(availableAmmo, a => a.damage);

      const muzzleSpeed = w.initSpeedMultiplier * a.initSpeed;
      const dropOffSpeed = a.typicalSpeed * a.defaultDamageOverride;
      const combinedDamage = a.damage * (a.projectilesCount || 1);
      const shotDamage = bulletDamage(combinedDamage, muzzleSpeed, dropOffSpeed);
      const dps = shotDamage * shotsPerS;
      return {
        name: w.name,
        ammo: a.name,
        shotDamage,
        shotsPerS,
        dps,
        maxMagazineDepth
      };
    })
    .sort((a, b) => a.dps - b.dps);
}

function WeaponsChart() {
  const weapons = useMemo(() => transformData(), []);

  const x = weapons.map(w => w.name);
  const y = weapons.map(w => w.dps);

  const mutants = mutantsData
    .map(m => {
      const hp = Math.round(m.globalHealth / m.damageMultiplier);
      return {type: "scatter", mode: "lines", x, y: Array(x.length).fill(hp), name: m.name, hp};
    })
    .sort((a, b) => b.hp - a.hp);

  return (
    <>
      <Plot
        data={[{type: "bar", x, y, name: "Урон"}, ...mutants]}
        layout={{
          title: {text: "Максимальный урон/с"},
          autosize: true,
          yaxis: {
            type: "log",
            title: {text: "Урон"},
            autorange: true
          },
          hovermode: "x unified"
        }}
        useResizeHandler={true}
        style={{width: "100%", height: "100%"}}
      />
    </>
  );
}

export default WeaponsChart;

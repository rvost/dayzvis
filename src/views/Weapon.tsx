import {useLoaderData, useSearchParams} from "react-router";
import ammoData from "../data/ammo.json";
import weaponsData from "../data/weapons.json";
import {useMemo, useState} from "react";
import {bulletDamage, range, speedAtDistance} from "../utils";
import Plot from "react-plotly.js";

export function weaponLoader({params}) {
  const weaponClass = params.weaponClass;
  const weapon = weaponsData.find(w => w.className == weaponClass);
  weapon.chamberableFrom = weapon?.chamberableFrom.filter(a => a in ammoData);
  const ammo = new Map();
  for (const a of weapon?.chamberableFrom) {
    ammo.set(a, ammoData[a]);
  }
  return {weapon, ammo};
}

const x = [...range(200), ...range(200, 1000, 25)];

function Weapon() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedAmmo, setSelectedAmmo] = useState(searchParams.get("ammo") || undefined);
  const {weapon, ammo} = useLoaderData();

  const y = useMemo(() => {
    const a = ammo.get(selectedAmmo);
    const dropOffSpeed = a.typicalSpeed * a.defaultDamageOverride;
    const initSpeed = a.initSpeed * weapon.initSpeedMultiplier;
    const damage = a.damage * (a.projectilesCount || 1);
    return x
      .map(distance => speedAtDistance(initSpeed, distance, a.airFriction))
      .map(speed => bulletDamage(damage, speed, dropOffSpeed));
  }, [weapon, ammo, selectedAmmo]);

  return (
    <>
      <label>
        Боеприпас:
        <select defaultValue={selectedAmmo} onChange={e => {
          const ammoClass = e.target.value
          setSelectedAmmo(e.target.value);
          setSearchParams({ammo:ammoClass});
          }}>
          {[...ammo].map(([k, v]) => (
            <option key={k} value={k}>{v.name}</option>
          ))}
        </select>
      </label>
      <Plot
        data={[{type: "scatter", x, y, mode: "lines"}]}
        layout={{
          title: {text: "Падение урона с расстоянием"},
          autosize: true,
          xaxis: {
            title: {text:"Расстояние"}
          },
          yaxis: {
            title: {text:"Урон"}
          }
        }}
        useResizeHandler={true}
        style={{width: "100%", height: "100%"}}
      />
    </>
  );
}
export default Weapon;

import {TreeDataGrid, type Column, type SortColumn} from "react-data-grid";
import {bulletDamage, clampToSimulationRate} from "../utils";
import ammoData from "../data/ammo.json";
import weaponsData from "../data/weapons.json";
import {useMemo, useState} from "react";
import {Link} from "react-router";

interface Row {
  id: string;
  name: string;
  ammo: string;
  shotDamage: number;
  shotsPerS: number;
  dps: number;
  maxMagazineDepth: number;
}

function transformData(): Row[] {
  return weaponsData.flatMap(w => {
    const shotsPerS = Math.floor(1 / clampToSimulationRate(w.minReloadTime)) || 1;
    const maxMagazineDepth = Math.max(...w.magazines);
    return w.chamberableFrom
      .filter(x => x in ammoData)
      .map(x => ({className: x, ...ammoData[x]}))
      .map(a => {
        const muzzleSpeed = w.initSpeedMultiplier * a.initSpeed;
        const dropOffSpeed = a.typicalSpeed * a.defaultDamageOverride;
        const combinedDamage = a.damage * (a.projectilesCount || 1);
        const shotDamage = Math.round(bulletDamage(combinedDamage, muzzleSpeed, dropOffSpeed));
        const dps = shotDamage * shotsPerS;
        return {
          id: `${w.className}?ammo=${a.className}`,
          name: w.name,
          ammo: a.name,
          shotDamage,
          shotsPerS,
          dps,
          maxMagazineDepth
        };
      });
  });
}

const columns = [
  {
    key: "name",
    name: "Название",
    renderCell({row}) {
      return <Link to={`/weapon/${row.id}`}>{row.name}</Link>;
    }
  },
  {
    key: "ammo",
    name: "Боеприпас",
    renderCell({row}) {
      return <Link to={`/weapon/${row.id}`}>{row.name}</Link>;
    }
  },
  {
    key: "shotDamage",
    name: "Урон выстрела",
    renderGroupCell({childRows}) {
      return childRows.reduce((prev, {shotDamage}) => Math.max(prev, shotDamage), 0);
    }
  },
  {key: "shotsPerS", name: "Выстрелов/с"},
  {
    key: "dps",
    name: "Урон/с",
    renderGroupCell({childRows}) {
      return childRows.reduce((prev, {dps}) => Math.max(prev, dps), 0);
    }
  },
  {key: "maxMagazineDepth", name: "Макс. емкость магазина"}
];

const groupOptions = ["ammo", "name"];

type Comparator = (a: Row, b: Row) => number;
function getComparator(sortColumn: keyof Row): Comparator {
  switch (sortColumn) {
    case "name":
    case "ammo":
      return (a, b) => {
        return a[sortColumn].localeCompare(b[sortColumn]);
      };
    case "shotDamage":
    case "shotsPerS":
    case "dps":
    case "maxMagazineDepth":
      return (a, b) => {
        return a[sortColumn] - b[sortColumn];
      };
    default:
      throw new Error(`unsupported sortColumn: "${sortColumn}"`);
  }
}

function rowKeyGetter(row: Row) {
  return row.id;
}

function rowGrouper(rows, columnKey: string) {
  // @ts-expect-error
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return Object.groupBy(rows, r => r[columnKey]) as Record<string, readonly R[]>;
}

function Weapons() {
  const [expandedGroupIds, setExpandedGroupIds] = useState((): ReadonlySet<unknown> => new Set());
  const [sortColumns, setSortColumns] = useState<readonly SortColumn[]>([]);
  const [groupKey, setGroupKey] = useState(groupOptions[0]);
  const [rows, setRows] = useState(transformData());

  const sortedRows = useMemo((): readonly Row[] => {
    if (sortColumns.length === 0) return rows;

    return rows.toSorted((a, b) => {
      for (const sort of sortColumns) {
        const comparator = getComparator(sort.columnKey);
        const compResult = comparator(a, b);
        if (compResult !== 0) {
          return sort.direction === "ASC" ? compResult : -compResult;
        }
      }
      return 0;
    });
  }, [rows, sortColumns]);

  return (
    <>
      <label>
        Группировка по:
        <select defaultValue={groupOptions[0]} onChange={e => setGroupKey(e.target.value)}>
          <option value={groupOptions[0]}>Боеприпас</option>
          <option value={groupOptions[1]}>Оружие</option>
        </select>
      </label>

      <TreeDataGrid
        style={{height: "100%"}}
        columns={columns}
        rows={sortedRows}
        groupBy={[groupKey]}
        rowGrouper={rowGrouper}
        rowKeyGetter={rowKeyGetter}
        expandedGroupIds={expandedGroupIds}
        onExpandedGroupIdsChange={setExpandedGroupIds}
        defaultColumnOptions={{
          sortable: true,
          resizable: true
        }}
        sortColumns={sortColumns}
        onSortColumnsChange={setSortColumns}
      />
    </>
  );
}

export default Weapons;

import { useEffect, useState } from "react";
import { fetchUnits } from "../services/api";

export function useUnits() {
  const [units, setUnits] = useState([]);
  const [unitsError, setUnitsError] = useState("");
  useEffect(() => {
    let active = true;
    fetchUnits().then((entries) => { if (active) setUnits(entries.map(({ unit }) => unit)); })
      .catch(() => { if (active) setUnitsError("Could not load the measurement catalog."); });
    return () => { active = false; };
  }, []);
  return { units, unitsError };
}

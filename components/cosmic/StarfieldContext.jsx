"use client";
import React, { createContext, useContext, useMemo } from 'react';

const StarfieldContext = createContext(null);

export function StarfieldProvider({ transitData, flowState, children }) {
  const value = useMemo(() => {
    const aspect = transitData?.transit?.aspect?.toLowerCase() || "";
    const isEthereal = aspect.includes("neptune") || aspect.includes("moon") || aspect.includes("venus");
    const isFiery = aspect.includes("mars") || aspect.includes("sun") || aspect.includes("pluto");

    const velocity = isEthereal ? 0.3 : (isFiery ? 1.5 : 1);

    let hue = "neutral";
    if (isFiery) hue = "fiery";
    else if (aspect.includes("jupiter") || aspect.includes("venus")) hue = "ethereal";
    else if (isEthereal) hue = "cool";

    // Read density from localStorage (safe: runs client-side in provider)
    let density = 200;
    if (typeof window !== 'undefined') {
      const pref = localStorage.getItem('starfieldDensity') || 'Medium';
      if (pref === 'Low') density = 60;
      if (pref === 'High') density = 450;
    }

    return { velocity, hue, density, flowState, aspect };
  }, [transitData?.transit?.aspect, flowState]);

  return (
    <StarfieldContext.Provider value={value}>
      {children}
    </StarfieldContext.Provider>
  );
}

export function useStarfield() {
  const ctx = useContext(StarfieldContext);
  if (!ctx) throw new Error("useStarfield must be used within a StarfieldProvider");
  return ctx;
}

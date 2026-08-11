// Shared between the Production Logistics form (src/app/projects/[id]/page.tsx)
// and the rules engine's flag/flagAnyOf conditions. Deliberately not asked at
// intake — you don't know what's actually in the shoot until the script and
// storyboard are locked.
export const SPECIAL_SCENE_FLAGS: { key: string; label: string }[] = [
  { key: "hasStunts", label: "Stunts / choreographed physical action" },
  { key: "hasWeapons", label: "Prop weapons / simulated firearms" },
  { key: "hasMinors", label: "Minors on camera" },
  { key: "hasNudity", label: "Nudity / simulated sex" },
  { key: "hasAnimals", label: "Animals on set" },
  { key: "hasVehicles", label: "Picture vehicles / driving" },
  { key: "hasWaterOrRain", label: "Water proximity / rain" },
  { key: "hasHeights", label: "Rooftops, heights, or ledges" },
  { key: "hasFireOrPyro", label: "Fire, open flame, or pyrotechnics" },
];

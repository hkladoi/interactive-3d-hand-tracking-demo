import type { ObjectPreset } from "@/lib/types";

export const OBJECT_PRESETS = [
  {
    category: "abstract",
    defaultScale: 1,
    description: "The original wireframe tree hologram.",
    id: "abstract-hologram",
    name: "Abstract Hologram",
    type: "hologram"
  },
  {
    category: "abstract",
    defaultScale: 0.82,
    description: "Angular transparent crystal geometry.",
    id: "crystal",
    name: "Crystal",
    type: "crystal"
  },
  {
    category: "tech",
    defaultScale: 0.86,
    description: "Glowing orb with a technical wireframe shell.",
    id: "energy-orb",
    name: "Energy Orb",
    type: "orb"
  },
  {
    category: "tech",
    defaultScale: 0.95,
    description: "Floating ring preset for interface-style demos.",
    id: "hologram-ring",
    name: "Hologram Ring",
    type: "ring"
  },
  {
    category: "space",
    defaultScale: 0.74,
    description: "Mini planet-style orb using built-in geometry.",
    id: "mini-planet",
    name: "Mini Planet",
    type: "orb"
  },
  {
    category: "abstract",
    defaultScale: 0.76,
    description: "Sharp wireframe cube for simple hit testing.",
    id: "wireframe-cube",
    name: "Wireframe Cube",
    type: "crystal"
  },
  {
    category: "custom",
    defaultScale: 1,
    description: "Placeholder for a custom GLB or GLTF model.",
    id: "custom-glb",
    name: "Custom GLB Placeholder",
    type: "model"
  }
] satisfies ObjectPreset[];

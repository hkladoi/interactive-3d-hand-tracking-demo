export const MODEL_REGISTRY = [
  {
    id: "tree",
    name: "Tree Model",
    url: "/models/tree.glb"
  },
  {
    id: "robot",
    name: "Robot Model",
    url: "/models/robot.glb"
  }
] as const;

export function isValidModelUrl(url: string) {
  return url.startsWith("/models/") && (url.endsWith(".glb") || url.endsWith(".gltf"));
}

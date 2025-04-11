import { proxy } from "valtio";

const state = proxy({
  intro: true,
  colors: ["silver", "white", "yellow", "lightgreen", "purple", "red", "black", "cyan", "pink", "violet", "forestgreen", "#FF7F00"],
  decals: ["react", "three2", "pmndrs"],
  selectedColor: "pink",
  selectedDecal: "pmndrs",
  selectedModel: "hoodie",
  decalPosition: [0, 0.04, 0.15],
  decalRotation: [0, 0, 0],
  decalScale: 0.15,
});

export { state };

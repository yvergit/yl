import { proxy } from "valtio";

const state = proxy({
  intro: true,
  colors: ["black", "white", "yellow", "lightgreen", "purple", "red", "silver", "cyan", "blue", "violet", "forestgreen", "pink", "#FF7F00"],
  decals: ["react", "three2", "pmndrs"],
  selectedColor: "white",
  selectedDecal: "pmndrs",
  selectedModel: "yoga_pants",
  decalPosition: [0, 0.04, 0.15],
  decalRotation: [0, 0, 0],
  decalScale: 0.15,
});

export { state };

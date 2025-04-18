import { proxy } from "valtio";

const state = proxy({
  intro: true,
  colors: [
    { code: "black", name: "Black" },
    { code: "white", name: "White" },
    { code: "yellow", name: "Yellow" },
    { code: "lightgreen", name: "Light Green" },
    { code: "purple", name: "Purple" },
    { code: "red", name: "Red" },
    { code: "silver", name: "Silver" },
    { code: "cyan", name: "Cyan" },
    { code: "blue", name: "Blue" },
    { code: "violet", name: "Violet" },
    { code: "forestgreen", name: "Forest Green" },
    { code: "pink", name: "Pink" },
    { code: "#FF7F00", name: "Holland" }
  ],
  decals: ["react", "three2", "pmndrs"],
  selectedColor: "white",
  selectedModel: "yoga_pants",
  selectedDecal: "pmndrs",
  decalPosition: [0, 0.04, 0.15],
  decalRotation: [0, 0, 0],
  decalScale: 0.15,
});

export { state };
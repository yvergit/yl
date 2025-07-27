import { proxy } from "valtio";

const state = proxy({
  intro: true,
  colors: [
    { code: "black", name: "Black" },
    { code: "white", name: "White" },
    { code: "#ffcb00", name: "Brazil" },
    { code: "lightgreen", name: "Light Green" },
    { code: "purple", name: "Purple" },
    { code: "red", name: "Red" },
    { code: "silver", name: "Silver" },
    { code: "#418FDE", name: "Somalia" },
    { code: "#00209F", name: "Haiti" },
    { code: "violet", name: "Violet" },
    { code: "forestgreen", name: "Forest Green" },
    { code: "pink", name: "Pink" },
    { code: "#FF7F00", name: "Netherlands" }
  ],
  decals: ["react", "three2", "pmndrs"],
  selectedColor: "#FF7F00",
  selectedModel: "yoga_pants",
  selectedDecal: "pmndrs",
  decalPosition: [0, 0.04, 0.15],
  decalRotation: [0, 0, 0],
  decalScale: 0.15,
});

export { state };

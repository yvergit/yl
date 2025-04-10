import { useControls } from "leva";
import { useSnapshot } from "valtio";
import { state } from "./store";

export default function DecalControls() {
  const snap = useSnapshot(state);

  const { positionX, positionY, positionZ, rotationX, rotationY, rotationZ, scale } = useControls("Decal", {
    positionX: {
      value: snap.decalPosition[0],
      min: -1,
      max: 1,
      step: 0.01,
      onChange: (v) => (state.decalPosition[0] = v),
    },
    positionY: {
      value: snap.decalPosition[1],
      min: -1,
      max: 1,
      step: 0.01,
      onChange: (v) => (state.decalPosition[1] = v),
    },
    scale: {
      value: snap.decalScale,
      min: 0.01,
      max: 1,
      step: 0.01,
      onChange: (v) => (state.decalScale = v),
    },
  });

  return null;
}

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { easing } from "maath";

import {
  useGLTF,
  Environment,
  Center,
  AccumulativeShadows,
  RandomizedLight,
  useTexture,
  Decal,
  OrbitControls, // 👈 Added OrbitControls
} from "@react-three/drei";
import { useSnapshot } from "valtio";
import { state } from "./store";

export const App = ({ position = [0, 0, 2.5], fov = 25 }) => (
  <Canvas
    shadows
    gl={{ preserveDrawingBuffer: true }}
    camera={{ position, fov }}
    eventSource={document.getElementById("root")}
    eventPrefix="client"
  >
    <ambientLight intensity={0.5} />
    <Environment files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/potsdamer_platz_1k.hdr" />
    <Backdrop />
    <Center>
      <Shirt />
    </Center>
    <OrbitControls enableZoom={false} /> {/* 👈 Orbit controls enabled */}
  </Canvas>
);

function Shirt(props) {
  const snap = useSnapshot(state);

  const texture = useTexture(`/${snap.selectedDecal}.png`);

  const { nodes, materials } = useGLTF("/shirt_baked_collapsed.glb");

  useFrame((state, delta) =>
    easing.dampC(materials.lambert1.color, snap.selectedColor, 0.25, delta)
  );

  return (
    <mesh
      castShadow
      geometry={nodes.T_Shirt_male.geometry}
      material={materials.lambert1}
      material-roughness={1}
      {...props}
      dispose={null}
    >
      <Decal
        position={[0, 0.04, 0.15]}
        rotation={[0, 0, 0]}
        scale={0.15}
        opacity={0.7}
        map={texture}
        map-anisotropy={16}
      />
    </mesh>
  );
}

function Backdrop() {
  const shadows = useRef();

  useFrame((state, delta) =>
    easing.dampC(
      shadows.current.getMesh().material.color,
      state.selectedColor,
      0.25,
      delta
    )
  );

  return (
    <AccumulativeShadows
      ref={shadows}
      temporal
      frames={60}
      alphaTest={0.85}
      scale={10}
      rotation={[Math.PI / 2, 0, 0]}
      position={[0, 0, -0.14]}
    >
      <RandomizedLight
        amount={4}
        radius={9}
        intensity={0.55}
        ambient={0.25}
        position={[5, 5, -10]}
      />
      <RandomizedLight
        amount={4}
        radius={5}
        intensity={0.25}
        ambient={0.55}
        position={[-5, 5, -9]}
      />
    </AccumulativeShadows>
  );
}

useGLTF.preload("/shirt_baked_collapsed.glb");
["/react.png", "/three2.png", "/pmndrs.png"].forEach(useTexture.preload);

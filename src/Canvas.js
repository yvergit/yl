import { useRef, Suspense, useMemo, useState, useEffect } from "react";
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
  OrbitControls,
} from "@react-three/drei";
import { useSnapshot } from "valtio";
import { state } from "./store";

export const App = ({ position = [0, 0, 2.5], fov = 25 }) => {
  return (
    <>
      <Canvas
        shadows
        gl={{ preserveDrawingBuffer: true }}
        camera={{ position, fov }}
        eventSource={document.getElementById("root")}
        eventPrefix="client"
      >
        <ambientLight intensity={0.5} />
        <Environment files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/potsdamer_platz_1k.hdr" />
        <Center>
          <ModelRenderer />
        </Center>
        <OrbitControls enableZoom={false} />
      </Canvas>
    </>
  );
};

function ModelRenderer() {
  const snap = useSnapshot(state);

  const renderModel = () => {
    switch (snap.selectedModel) {
      case "sports_tee":
        return <Sports_tee />;
      case "yoga_pants":
        return <Yoga_pants />;
      case "yoga_mat":
        return <Yoga_mat />;
      default:
        return null;
    }
  };

  return (
    <group key={snap.selectedModel}>
      <AccumulativeShadows
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
      {renderModel()}
    </group>
  );
}

function Sports_tee(props) {
  const snap = useSnapshot(state);
  const { nodes, materials } = useGLTF("/shirt_baked_collapsed.glb");

  useFrame((state, delta) => {
    if (materials.lambert1) {
      easing.dampC(materials.lambert1.color, snap.selectedColor, 0.25, delta);
    }
  });

  return (
    <mesh
      castShadow
      geometry={nodes.T_Shirt_male.geometry}
      material={materials.lambert1}
      material-roughness={2}
      {...props}
      dispose={null}
    >
      <CustomDecal />
    </mesh>
  );
}

function Yoga_pants(props) {
  const snap = useSnapshot(state);
  const { nodes, materials } = useGLTF("/hoodie_model.glb");

  useFrame((state, delta) => {
    if (materials.leggings) {
      easing.dampC(materials.leggings.color, snap.selectedColor, 0.25, delta);
    }
  });

  return (
    <mesh
      castShadow
      geometry={nodes.leggings_low.geometry}
      material={materials.leggings}
      material-roughness={1}
      {...props}
      dispose={null}
    >
      <CustomDecal />
    </mesh>
  );
}

function Yoga_mat(props) {
  const snap = useSnapshot(state);
  const { nodes, materials } = useGLTF("/jacket_model.glb");

  useFrame((state, delta) => {
    if (materials.Yogamat) {
      easing.dampC(materials.Yogamat.color, snap.selectedColor, 0.25, delta);
    }
  });

  return (
    <mesh
      castShadow
      geometry={nodes.da_mat.geometry}
      material={materials.Yogamat}
      material-roughness={1}
      {...props}
      dispose={null}
    >
      <CustomDecal />
    </mesh>
  );
}

function CameraRig({ children }) {
  const group = useRef();
  useFrame((state, delta) => {
    easing.damp3(state.camera.position, [0, 0, 2], 0.25, delta);
    easing.dampE(
      group.current.rotation,
      [state.pointer.y / 10, -state.pointer.x / 5, 0],
      0.25,
      delta
    );
  });
  return <group ref={group}>{children}</group>;
}

function CustomDecal() {
  const snap = useSnapshot(state);
  const texture = useTexture(`/${snap.selectedDecal}.png`);

  const adjustedPosition = {
    sports_tee: snap.decalPosition,
    yoga_pants: [
      snap.decalPosition[0] + 0.05,
      snap.decalPosition[1] + 0.20,
      snap.decalPosition[2] + 0.03,
    ],
    yoga_mat: [
      snap.decalPosition[0],
      snap.decalPosition[1],
      snap.decalPosition[2],
    ],
  }[snap.selectedModel];

  const scaleMultiplier = useMemo(() => {
    return {
      sports_tee: 1,
      yoga_pants: 1.7,
      yoga_mat: 2.5,
    }[snap.selectedModel];
  }, [snap.selectedModel]);

  const finalScale = useMemo(() => snap.decalScale * scaleMultiplier, [snap.decalScale, scaleMultiplier]);

  return (
    <Decal
      position={adjustedPosition}
      rotation={snap.decalRotation}
      scale={[finalScale, finalScale, finalScale * 1.2]}
      map={texture}
      opacity={0.8}
      map-anisotropy={16}
      depthTest
      depthWrite={false}
    />
  );
}

// Preload GLTF + textures
useGLTF.preload("/shirt_baked_collapsed.glb");
useGLTF.preload("/hoodie_model.glb");
useGLTF.preload("/jacket_model.glb");
["/react.png", "/three2.png", "/pmndrs.png"].forEach(useTexture.preload);

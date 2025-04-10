import { useRef, Suspense } from "react";
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
import DecalControls from "./DecalControls";

export const App = ({ position = [0, 0, 2.5], fov = 25 }) => (
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
    <DecalControls />
  </>
);

function ModelRenderer() {
  const snap = useSnapshot(state);

  const renderModel = () => {
    switch (snap.selectedModel) {
      case "shirt":
        return <Shirt />;
      case "hoodie":
        return <Hoodie />;
      case "jacket":
        return <Jacket />;
      default:
        return null;
    }
  };

  return (
    <group key={snap.selectedModel}>
      {" "}
      {/* This forces remount on model switch */}
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

function Shirt(props) {
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
      material-roughness={1}
      {...props}
      dispose={null}
    >
      <CustomDecal />
    </mesh>
  );
}

function Hoodie(props) {
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

function Jacket(props) {
  const snap = useSnapshot(state);
  const { nodes, materials } = useGLTF("/jacket_model.glb");

  useFrame((state, delta) => {
    if (materials.Material) {
      easing.dampC(materials.Material.color, snap.selectedColor, 0.25, delta);
    }
  });

  return (
    <mesh
      castShadow
      geometry={nodes.'3d-model_1'.geometry}
      material={materials.wire_177028149}
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

// CustomDecal Component
function CustomDecal() {
  const snap = useSnapshot(state);
  const texture = useTexture(`/${snap.selectedDecal}.png`);

  const adjustedPosition = {
    shirt: snap.decalPosition,
    hoodie: [
      snap.decalPosition[0],
      snap.decalPosition[1],
      snap.decalPosition[2] + 0.03,
    ],
    jacket: [
      snap.decalPosition[0],
      snap.decalPosition[1],
      snap.decalPosition[2] + 0.02,
    ],
  }[snap.selectedModel];

  const scaleMultiplier = {
    shirt: 1,
    hoodie: 2.1,
    jacket: 1.1,
  }[snap.selectedModel];

  const finalScale = snap.decalScale * scaleMultiplier;

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

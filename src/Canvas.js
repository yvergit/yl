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
      <Backdrop />
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

  switch (snap.selectedModel) {
    case "shirt":
      return <Shirt />;
    case "hoodie":
      return (
        <Suspense fallback={null}>
          <Hoodie />
        </Suspense>
      );
    case "jacket":
      return <Jacket />;
    default:
      return <Shirt />;
  }
}

function Shirt(props) {
  const snap = useSnapshot(state);
  const texture = useTexture(`/${snap.selectedDecal}.png`);
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
      <Decal
        position={snap.decalPosition}
        rotation={snap.decalRotation}
        scale={[snap.decalScale, snap.decalScale, snap.decalScale]}
        map={texture}
        opacity={0.8}
        map-anisotropy={16}
        depthTest
        depthWrite={false}
      />
    </mesh>
  );
}

function Hoodie(props) {
  const snap = useSnapshot(state);
  const texture = useTexture(`/${snap.selectedDecal}.png`);
  const { nodes, materials } = useGLTF("/hoodie_model.glb");

  const hoodieMesh = nodes.leggings_low || Object.values(nodes)[0];
  const hoodieMaterial = materials.leggings || Object.values(materials)[0];

  useFrame((state, delta) => {
    if (hoodieMaterial) {
      easing.dampC(hoodieMaterial.color, snap.selectedColor, 0.25, delta);
    }
  });

  return (
    <mesh
      castShadow
      geometry={hoodieMesh.geometry}
      material={hoodieMaterial}
      position={[0, -0.05, 0]} // moved slightly for better ground contact
      {...props}
      dispose={null}
    >
      <Decal
        position={snap.decalPosition}
        rotation={snap.decalRotation}
        scale={[snap.decalScale, snap.decalScale, snap.decalScale]}
        map={texture}
        opacity={0.8}
        map-anisotropy={16}
        depthTest
        depthWrite={false}
      />
    </mesh>
  );
}

function Jacket(props) {
  const snap = useSnapshot(state);
  const texture = useTexture(`/${snap.selectedDecal}.png`);
  const { nodes, materials } = useGLTF("/jacket_model.glb");

  useFrame((state, delta) => {
    if (materials.Material) {
      easing.dampC(materials.Material.color, snap.selectedColor, 0.25, delta);
    }
  });

  return (
    <mesh
      castShadow
      geometry={nodes.Jacket.geometry}
      material={materials.Material}
      {...props}
      dispose={null}
    >
      <Decal
        position={snap.decalPosition}
        rotation={snap.decalRotation}
        scale={[snap.decalScale, snap.decalScale, snap.decalScale]}
        map={texture}
        opacity={0.7}
        map-anisotropy={16}
        depthTest
        depthWrite={false}
      />
    </mesh>
  );
}

function Backdrop() {
  const shadows = useRef();
  const snap = useSnapshot(state);

  useFrame((state, delta) =>
    easing.dampC(
      shadows.current.getMesh().material.color,
      snap.selectedColor,
      0.25,
      delta
    )
  );

  return (
    <AccumulativeShadows
      ref={shadows}
      temporal
      frames={90}
      alphaTest={0.85}
      scale={10}
      rotation={[Math.PI / 2, 0, 0]}
      position={[0, -0.25, 0]} // moved deeper for hoodie
    >
      <RandomizedLight
        amount={4}
        radius={8}
        intensity={0.6}
        ambient={0.3}
        position={[5, 5, -10]}
      />
      <RandomizedLight
        amount={4}
        radius={4}
        intensity={0.3}
        ambient={0.5}
        position={[-5, 5, -9]}
      />
    </AccumulativeShadows>
  );
}

// Preload GLTF + textures
useGLTF.preload("/shirt_baked_collapsed.glb");
useGLTF.preload("/hoodie_model.glb");
useGLTF.preload("/jacket_model.glb");
["/react.png", "/three2.png", "/pmndrs.png"].forEach(useTexture.preload);

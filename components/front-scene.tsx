"use client";
import React, { useEffect, useMemo, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useFBO } from "@react-three/drei";
import {Room} from "./Room/Room";
import { Orb } from "./Orb";




export default function FrontScene() {

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <Canvas>
        <ambientLight intensity={3} />
        <pointLight position={[5, 5, 5]} intensity={1} />
        <Orb />
        <Room />
        <OrbitControls />
      </Canvas>
    </div>
  );
}
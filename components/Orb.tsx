"use client";
import React, { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, extend, createPortal } from "@react-three/fiber";
import { useFBO } from "@react-three/drei";
import SimulationMaterial from "./SimulationMaterial";
import vertexShader from "!!raw-loader!./vertexShader.glsl";
import fragmentShader from "!!raw-loader!./fragmentShader.glsl";
import * as THREE from "three";

declare module "@react-three/fiber" {
    interface ThreeElements {
      simulationMaterial: JSX.IntrinsicElements['shaderMaterial'] & { args: [number] };
    }
  }
  
  extend({ SimulationMaterial: SimulationMaterial });
  
  export const Orb = () => {
    const size = 128;
  
    const points = useRef<THREE.Points>(null!);
    const simulationMaterialRef = useRef<SimulationMaterial>(null!);
  
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(
      -1,
      1,
      1,
      -1,
      1 / Math.pow(2, 53),
      1
    );
    const positions = new Float32Array([
      -1, -1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, 1, 1, 0, -1, 1, 0,
    ]);
    const uvs = new Float32Array([0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0]);
  
    const renderTarget = useFBO(size, size, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      stencilBuffer: false,
      type: THREE.FloatType,
    });
  
    const particlesPosition = useMemo(() => {
      const length = size * size;
      const particles = new Float32Array(length * 3);
      for (let i = 0; i < length; i++) {
        let i3 = i * 3;
        particles[i3 + 0] = (i % size) / size;
        particles[i3 + 1] = i / size / size;
      }
      return particles;
    }, [size]);
  
    const uniforms = useMemo(
      () => ({
        uPositions: {
          value: null,
        },
        uOffset: {
          value: new THREE.Vector3(0, 2, 0),
        },
      }),
      []
    );
  
    useFrame((state) => {
      const { gl, clock } = state;
  
      gl.setRenderTarget(renderTarget);
      gl.clear();
      gl.render(scene, camera);
      gl.setRenderTarget(null);
  
      (points.current.material as THREE.ShaderMaterial).uniforms.uPositions.value = renderTarget.texture;
  
      simulationMaterialRef.current.uniforms.uTime.value = clock.elapsedTime;
    });
  
    return (
      <>
        {createPortal(
          <mesh>
            <simulationMaterial ref={simulationMaterialRef} args={[size] as any} />
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={positions.length / 3}
                array={positions}
                itemSize={3}
              />
              <bufferAttribute
                attach="attributes-uv"
                count={uvs.length / 2}
                array={uvs}
                itemSize={2}
              />
            </bufferGeometry>
          </mesh>,
          scene
        )}
        <points ref={points}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={particlesPosition.length / 3}
              array={particlesPosition}
              itemSize={3}
            />
          </bufferGeometry>
          <shaderMaterial
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            fragmentShader={fragmentShader}
            vertexShader={vertexShader}
            uniforms={uniforms}
          />
        </points>
      </>
    );
  };
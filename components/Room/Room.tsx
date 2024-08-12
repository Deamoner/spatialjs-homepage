import { useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { Mesh } from 'three'

export function Room() {
  // @ts-ignore
  const { nodes } = useGLTF('/level-react-draco.glb') as { nodes: { Level: Mesh } }
  const { camera } = useThree()
  return <mesh geometry={nodes.Level.geometry} material={nodes.Level.material} position={[-0.38, 0.69, 0.62]} rotation={[Math.PI / 2, -Math.PI / 9, 0]} />
}
'use client'

/**
 * HoloCardCloud — webgl-card-field Architecture 3 (Cloud-scatter)
 *
 * 133 textured planes scattered through 3D space against a near-black stage.
 * Cards drift slowly on a Lissajous orbit so the field always has motion even
 * when the cursor is still. Cursor parallax nudges the camera; depth-of-field
 * focuses on a band roughly 12 units in front, blurring the rest into a
 * cinematic depth wash.
 *
 * The holographic finish: each card material additively mixes a fresnel-driven
 * iridescent rim (cyan→magenta→cobalt) over the photo's color. Rim shifts as
 * the camera moves so cards "glint" like real holo cards.
 */

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { EffectComposer, DepthOfField, Bloom } from '@react-three/postprocessing'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { HOLO_CARDS } from './holo-cards-manifest'

const CARD_W = 1.5
const CARD_H = 2.1

// Deterministic pseudo-random so SSR and client agree without hydration churn.
function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface CardSpec {
  url: string
  x: number
  y: number
  z: number
  yaw: number
  pitch: number
  roll: number
  driftPhaseX: number
  driftPhaseY: number
  driftAmp: number
  rimSeed: number
}

function buildCardSpecs(urls: readonly string[]): CardSpec[] {
  const rand = mulberry32(0xc0ffee)
  return urls.map((url) => ({
    url,
    x: (rand() - 0.5) * 32,
    y: (rand() - 0.5) * 18,
    z: -2 - rand() * 38,
    yaw: (rand() - 0.5) * 0.6,
    pitch: (rand() - 0.5) * 0.35,
    roll: (rand() - 0.5) * 0.18,
    driftPhaseX: rand() * Math.PI * 2,
    driftPhaseY: rand() * Math.PI * 2,
    driftAmp: 0.18 + rand() * 0.22,
    rimSeed: rand(),
  }))
}

/**
 * Holographic material — extends MeshBasicMaterial so we don't need lighting,
 * and injects a fresnel-rim iridescent additive on top of the photo texture.
 */
function createHoloMaterial(texture: THREE.Texture, rimSeed: number) {
  const mat = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    toneMapped: false,
  })

  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = { value: 0 }
    shader.uniforms.uRimSeed = { value: rimSeed }

    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
         varying vec3 vWorldNormal;
         varying vec3 vWorldPos;`
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
         vec4 wp = modelMatrix * vec4(position, 1.0);
         vWorldPos = wp.xyz;
         vWorldNormal = normalize(mat3(modelMatrix) * normal);`
      )

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
         varying vec3 vWorldNormal;
         varying vec3 vWorldPos;
         uniform float uTime;
         uniform float uRimSeed;`
      )
      .replace(
        '#include <opaque_fragment>',
        `// Fresnel against the camera — strong at glancing angles
         vec3 viewDir = normalize(cameraPosition - vWorldPos);
         float fresnel = pow(1.0 - max(dot(vWorldNormal, viewDir), 0.0), 2.4);

         // Iridescent hue shift — cycles through cobalt → cyan → magenta
         float hue = fract(uRimSeed + uTime * 0.05 + fresnel * 0.6);
         vec3 iri = vec3(
           0.5 + 0.5 * cos(6.2831 * (hue + 0.00)),
           0.5 + 0.5 * cos(6.2831 * (hue + 0.33)),
           0.5 + 0.5 * cos(6.2831 * (hue + 0.66))
         );

         // Mix photo + iridescent rim additively
         vec3 finalRGB = diffuseColor.rgb + iri * fresnel * 0.85;

         // Subtle inner brightness lift so dark photos still read as glowing cards
         finalRGB += vec3(0.06, 0.07, 0.10);

         gl_FragColor = vec4(finalRGB, diffuseColor.a);
         #include <tonemapping_fragment>
         #include <colorspace_fragment>`
      )
    ;(mat as unknown as { userData: { shader?: typeof shader } }).userData.shader = shader
  }

  return mat
}

function HoloCard({ spec, texture }: { spec: CardSpec; texture: THREE.Texture }) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const material = useMemo(() => createHoloMaterial(texture, spec.rimSeed), [texture, spec.rimSeed])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (meshRef.current) {
      // Lissajous drift — never goes anywhere, just breathes
      meshRef.current.position.x = spec.x + Math.sin(t * 0.4 + spec.driftPhaseX) * spec.driftAmp
      meshRef.current.position.y = spec.y + Math.cos(t * 0.35 + spec.driftPhaseY) * spec.driftAmp
      meshRef.current.rotation.y = spec.yaw + Math.sin(t * 0.25 + spec.driftPhaseX) * 0.08
      meshRef.current.rotation.x = spec.pitch
      meshRef.current.rotation.z = spec.roll
    }
    const shader = (material as unknown as { userData: { shader?: { uniforms: { uTime: { value: number } } } } }).userData.shader
    if (shader) shader.uniforms.uTime.value = t
  })

  return (
    <mesh ref={meshRef} position={[spec.x, spec.y, spec.z]} material={material}>
      <planeGeometry args={[CARD_W, CARD_H]} />
    </mesh>
  )
}

function TexturedCards({ specs }: { specs: CardSpec[] }) {
  const textures = useMemo(() => {
    const loader = new THREE.TextureLoader()
    return specs.map((spec) => {
      const tex = loader.load(spec.url)
      tex.colorSpace = THREE.SRGBColorSpace
      tex.anisotropy = 4
      tex.minFilter = THREE.LinearFilter
      return tex
    })
  }, [specs])

  return (
    <>
      {specs.map((spec, i) => (
        <HoloCard key={spec.url} spec={spec} texture={textures[i]} />
      ))}
    </>
  )
}

function CursorParallax() {
  const { camera } = useThree()
  const target = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      target.current.x = (e.clientX / window.innerWidth - 0.5) * 2
      target.current.y = -(e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  useFrame(() => {
    camera.position.x += (target.current.x * 3.2 - camera.position.x) * 0.05
    camera.position.y += (target.current.y * 1.8 - camera.position.y) * 0.05
    camera.lookAt(0, 0, -14)
  })

  return null
}

function ScrollDepth() {
  const { camera } = useThree()
  const target = useRef(2)

  useEffect(() => {
    const onScroll = () => {
      const maxScroll = Math.max(1, document.body.scrollHeight - window.innerHeight)
      const p = Math.min(1, window.scrollY / maxScroll)
      // Camera slides forward as user scrolls — gives a "pulling closer" feel
      target.current = 2 - p * 6
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useFrame(() => {
    camera.position.z += (target.current - camera.position.z) * 0.04
  })

  return null
}

export function HoloCardCloud({ cardLimit = 110 }: { cardLimit?: number }) {
  // Subset on mobile via cardLimit prop; server-render fallback uses 0 cards.
  const [ready, setReady] = useState(false)
  useEffect(() => setReady(true), [])

  const specs = useMemo(
    () => buildCardSpecs(HOLO_CARDS.slice(0, cardLimit)),
    [cardLimit]
  )

  if (!ready) return null

  return (
    <Canvas
      camera={{ fov: 55, position: [0, 0, 2], near: 0.1, far: 80 }}
      dpr={[1, 1.6]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
    >
      <color attach="background" args={['#060608']} />
      <TexturedCards specs={specs} />
      <CursorParallax />
      <ScrollDepth />
      <EffectComposer>
        <DepthOfField focusDistance={0.018} focalLength={0.045} bokehScale={2.2} />
        <Bloom intensity={0.45} luminanceThreshold={0.55} luminanceSmoothing={0.2} mipmapBlur />
      </EffectComposer>
    </Canvas>
  )
}

export default HoloCardCloud

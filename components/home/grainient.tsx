'use client'

import { Mesh, Program, Renderer, Triangle } from 'ogl'
import { useEffect, useRef } from 'react'

const vertexShader = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`

const fragmentShader = `#version 300 es
precision highp float;

uniform vec2 iResolution;
uniform float iTime;
uniform float uTimeSpeed;
uniform float uColorBalance;
uniform float uWarpStrength;
uniform float uWarpFrequency;
uniform float uWarpSpeed;
uniform float uWarpAmplitude;
uniform float uBlendAngle;
uniform float uBlendSoftness;
uniform float uRotationAmount;
uniform float uNoiseScale;
uniform float uGrainAmount;
uniform float uGrainScale;
uniform float uGrainAnimated;
uniform float uContrast;
uniform float uGamma;
uniform float uSaturation;
uniform vec2 uCenterOffset;
uniform float uZoom;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;

out vec4 fragColor;

#define S(a,b,t) smoothstep(a,b,t)

mat2 Rot(float a) {
  float s = sin(a);
  float c = cos(a);
  return mat2(c, -s, s, c);
}

vec2 hash(vec2 p) {
  p = vec2(dot(p, vec2(2127.1, 81.17)), dot(p, vec2(1269.5, 283.37)));
  return fract(sin(p) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);

  float n = mix(
    mix(
      dot(-1.0 + 2.0 * hash(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
      dot(-1.0 + 2.0 * hash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)),
      u.x
    ),
    mix(
      dot(-1.0 + 2.0 * hash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
      dot(-1.0 + 2.0 * hash(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)),
      u.x
    ),
    u.y
  );

  return 0.5 + 0.5 * n;
}

void mainImage(out vec4 o, vec2 C) {
  float t = iTime * uTimeSpeed;
  vec2 uv = C / iResolution.xy;
  float ratio = iResolution.x / iResolution.y;
  vec2 tuv = uv - 0.5 + uCenterOffset;
  tuv /= max(uZoom, 0.001);

  float degree = noise(vec2(t * 0.1, tuv.x * tuv.y) * uNoiseScale);
  tuv.y *= 1.0 / ratio;
  tuv *= Rot(radians((degree - 0.5) * uRotationAmount + 180.0));
  tuv.y *= ratio;

  float frequency = uWarpFrequency;
  float ws = max(uWarpStrength, 0.001);
  float amplitude = uWarpAmplitude / ws;
  float warpTime = t * uWarpSpeed;
  tuv.x += sin(tuv.y * frequency + warpTime) / amplitude;
  tuv.y += sin(tuv.x * (frequency * 1.5) + warpTime) / (amplitude * 0.5);

  vec3 colLav = uColor1;
  vec3 colOrg = uColor2;
  vec3 colDark = uColor3;
  float b = uColorBalance;
  float s = max(uBlendSoftness, 0.0);
  mat2 blendRot = Rot(radians(uBlendAngle));
  float blendX = (tuv * blendRot).x;
  float edge0 = -0.3 - b - s;
  float edge1 = 0.2 - b + s;
  float v0 = 0.5 - b + s;
  float v1 = -0.3 - b - s;
  vec3 layer1 = mix(colDark, colOrg, S(edge0, edge1, blendX));
  vec3 layer2 = mix(colOrg, colLav, S(edge0, edge1, blendX));
  vec3 col = mix(layer1, layer2, S(v0, v1, tuv.y));

  vec2 grainUv = uv * max(uGrainScale, 0.001);
  if (uGrainAnimated > 0.5) {
    grainUv += vec2(iTime * 0.05);
  }

  float grain = fract(sin(dot(grainUv, vec2(12.9898, 78.233))) * 43758.5453);
  col += (grain - 0.5) * uGrainAmount;

  col = (col - 0.5) * uContrast + 0.5;
  float luma = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col = mix(vec3(luma), col, uSaturation);
  col = pow(max(col, 0.0), vec3(1.0 / max(uGamma, 0.001)));
  col = clamp(col, 0.0, 1.0);

  o = vec4(col, 1.0);
}

void main() {
  vec4 o = vec4(0.0);
  mainImage(o, gl_FragCoord.xy);
  fragColor = o;
}
`

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)

  if (!result) {
    return [1, 1, 1]
  }

  return [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255,
  ]
}

interface GrainientProps {
  className?: string
  color1?: string
  color2?: string
  color3?: string
  timeSpeed?: number
  colorBalance?: number
  warpStrength?: number
  warpFrequency?: number
  warpSpeed?: number
  warpAmplitude?: number
  blendAngle?: number
  blendSoftness?: number
  rotationAmount?: number
  noiseScale?: number
  grainAmount?: number
  grainScale?: number
  grainAnimated?: boolean
  contrast?: number
  gamma?: number
  saturation?: number
  centerX?: number
  centerY?: number
  zoom?: number
}

export default function Grainient({
  className = '',
  color1 = '#FF9FFC',
  color2 = '#5227FF',
  color3 = '#B19EEF',
  timeSpeed = 0.25,
  colorBalance = 0,
  warpStrength = 1,
  warpFrequency = 5,
  warpSpeed = 2,
  warpAmplitude = 50,
  blendAngle = 0,
  blendSoftness = 0.05,
  rotationAmount = 500,
  noiseScale = 2,
  grainAmount = 0.1,
  grainScale = 2,
  grainAnimated = false,
  contrast = 1.5,
  gamma = 1,
  saturation = 1,
  centerX = 0,
  centerY = 0,
  zoom = 0.9,
}: GrainientProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const propsRef = useRef({
    color1,
    color2,
    color3,
    timeSpeed,
    colorBalance,
    warpStrength,
    warpFrequency,
    warpSpeed,
    warpAmplitude,
    blendAngle,
    blendSoftness,
    rotationAmount,
    noiseScale,
    grainAmount,
    grainScale,
    grainAnimated,
    contrast,
    gamma,
    saturation,
    centerX,
    centerY,
    zoom,
  })

  useEffect(() => {
    propsRef.current = {
      color1,
      color2,
      color3,
      timeSpeed,
      colorBalance,
      warpStrength,
      warpFrequency,
      warpSpeed,
      warpAmplitude,
      blendAngle,
      blendSoftness,
      rotationAmount,
      noiseScale,
      grainAmount,
      grainScale,
      grainAnimated,
      contrast,
      gamma,
      saturation,
      centerX,
      centerY,
      zoom,
    }
  }, [
    color1,
    color2,
    color3,
    timeSpeed,
    colorBalance,
    warpStrength,
    warpFrequency,
    warpSpeed,
    warpAmplitude,
    blendAngle,
    blendSoftness,
    rotationAmount,
    noiseScale,
    grainAmount,
    grainScale,
    grainAnimated,
    contrast,
    gamma,
    saturation,
    centerX,
    centerY,
    zoom,
  ])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let renderer: Renderer | null = null

    try {
      renderer = new Renderer({
        webgl: 2,
        alpha: true,
        antialias: false,
        dpr: Math.min(window.devicePixelRatio || 1, 2),
      })
    } catch {
      return
    }

    const { gl } = renderer
    const canvas = gl.canvas
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.display = 'block'

    container.appendChild(canvas)

    const geometry = new Triangle(gl)
    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new Float32Array([1, 1]) },
        uTimeSpeed: { value: propsRef.current.timeSpeed },
        uColorBalance: { value: propsRef.current.colorBalance },
        uWarpStrength: { value: propsRef.current.warpStrength },
        uWarpFrequency: { value: propsRef.current.warpFrequency },
        uWarpSpeed: { value: propsRef.current.warpSpeed },
        uWarpAmplitude: { value: propsRef.current.warpAmplitude },
        uBlendAngle: { value: propsRef.current.blendAngle },
        uBlendSoftness: { value: propsRef.current.blendSoftness },
        uRotationAmount: { value: propsRef.current.rotationAmount },
        uNoiseScale: { value: propsRef.current.noiseScale },
        uGrainAmount: { value: propsRef.current.grainAmount },
        uGrainScale: { value: propsRef.current.grainScale },
        uGrainAnimated: { value: propsRef.current.grainAnimated ? 1 : 0 },
        uContrast: { value: propsRef.current.contrast },
        uGamma: { value: propsRef.current.gamma },
        uSaturation: { value: propsRef.current.saturation },
        uCenterOffset: { value: new Float32Array([propsRef.current.centerX, propsRef.current.centerY]) },
        uZoom: { value: propsRef.current.zoom },
        uColor1: { value: new Float32Array(hexToRgb(propsRef.current.color1)) },
        uColor2: { value: new Float32Array(hexToRgb(propsRef.current.color2)) },
        uColor3: { value: new Float32Array(hexToRgb(propsRef.current.color3)) },
      },
    })

    const mesh = new Mesh(gl, { geometry, program })

    const setSize = () => {
      const rect = container.getBoundingClientRect()
      const width = Math.max(1, Math.floor(rect.width))
      const height = Math.max(1, Math.floor(rect.height))

      renderer?.setSize(width, height)

      const resolution = program.uniforms.iResolution.value as Float32Array
      resolution[0] = gl.drawingBufferWidth
      resolution[1] = gl.drawingBufferHeight
    }

    const resizeObserver = new ResizeObserver(setSize)
    resizeObserver.observe(container)
    setSize()

    const start = performance.now()
    let animationFrame = 0

    const renderFrame = (time: number) => {
      const current = propsRef.current

      program.uniforms.iTime.value = (time - start) * 0.001
      program.uniforms.uTimeSpeed.value = current.timeSpeed
      program.uniforms.uColorBalance.value = current.colorBalance
      program.uniforms.uWarpStrength.value = current.warpStrength
      program.uniforms.uWarpFrequency.value = current.warpFrequency
      program.uniforms.uWarpSpeed.value = current.warpSpeed
      program.uniforms.uWarpAmplitude.value = current.warpAmplitude
      program.uniforms.uBlendAngle.value = current.blendAngle
      program.uniforms.uBlendSoftness.value = current.blendSoftness
      program.uniforms.uRotationAmount.value = current.rotationAmount
      program.uniforms.uNoiseScale.value = current.noiseScale
      program.uniforms.uGrainAmount.value = current.grainAmount
      program.uniforms.uGrainScale.value = current.grainScale
      program.uniforms.uGrainAnimated.value = current.grainAnimated ? 1 : 0
      program.uniforms.uContrast.value = current.contrast
      program.uniforms.uGamma.value = current.gamma
      program.uniforms.uSaturation.value = current.saturation
      ;(program.uniforms.uCenterOffset.value as Float32Array)[0] = current.centerX
      ;(program.uniforms.uCenterOffset.value as Float32Array)[1] = current.centerY
      program.uniforms.uZoom.value = current.zoom
      ;(program.uniforms.uColor1.value as Float32Array).set(hexToRgb(current.color1))
      ;(program.uniforms.uColor2.value as Float32Array).set(hexToRgb(current.color2))
      ;(program.uniforms.uColor3.value as Float32Array).set(hexToRgb(current.color3))

      renderer?.render({ scene: mesh })
      animationFrame = window.requestAnimationFrame(renderFrame)
    }

    animationFrame = window.requestAnimationFrame(renderFrame)

    return () => {
      window.cancelAnimationFrame(animationFrame)
      resizeObserver.disconnect()

      if (canvas.parentNode === container) {
        container.removeChild(canvas)
      }

      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [])

  return <div ref={containerRef} className={`relative h-full w-full overflow-hidden ${className}`.trim()} />
}

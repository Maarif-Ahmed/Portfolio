'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform float uScrollVelocity;
  uniform vec2 uResolution;
  varying vec2 vUv;

  // Modulo-less 2D white noise
  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  void main() {
    vec2 uv = vUv;
    float n = noise(uv * 3.0 + uTime * (0.2 + uScrollVelocity * 5.0));
    
    // Liquid cyan aesthetic
    vec3 color = vec3(0.0, 0.878, 1.0); // Cyan #00E0FF
    float mask = smoothstep(0.4, 0.6, n);
    
    // Low opacity background flow
    gl_FragColor = vec4(color, mask * 0.08); 
  }
`;

export default function LiquidBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef({ lastY: 0, velocity: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const geometry = new THREE.PlaneGeometry(2, 2);
    const uniforms = {
      uTime: { value: 0 },
      uScrollVelocity: { value: 0 },
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      depthWrite: false,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    camera.position.z = 1;

    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
    };

    const handleScroll = () => {
      const currentY = window.scrollY;
      const diff = Math.abs(currentY - scrollRef.current.lastY);
      scrollRef.current.velocity = diff * 0.01;
      scrollRef.current.lastY = currentY;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);

    let frameId: number;
    const animate = (time: number) => {
      uniforms.uTime.value = time * 0.001;
      uniforms.uScrollVelocity.value += (scrollRef.current.velocity - uniforms.uScrollVelocity.value) * 0.1;
      scrollRef.current.velocity *= 0.95; // Decay velocity

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate(0);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(frameId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 z-[-1] pointer-events-none select-none opacity-40 mix-blend-screen"
    />
  );
}

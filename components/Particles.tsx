
import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AppSettings, HandData } from '../types';
import { getShapePositions } from '../utils/shapes';

interface ParticlesProps {
  settings: AppSettings;
  hand: HandData;
}

const Particles: React.FC<ParticlesProps> = ({ settings, hand }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const count = settings.particleCount;

  // Initialize buffers
  const [positions, velocities, targetPositions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    const tar = getShapePositions(settings.shape, count);
    const col = new Float32Array(count * 3);

    const baseColor = new THREE.Color(settings.color);
    for (let i = 0; i < count; i++) {
      // Start randomly
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;

      // Randomize color slightly
      const c = baseColor.clone().multiplyScalar(0.5 + Math.random() * 0.5);
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }

    return [pos, vel, tar, col];
  }, [count, settings.color]); // Re-init if count or color changes

  // Update targets when shape changes
  useEffect(() => {
    const newTargets = getShapePositions(settings.shape, count);
    targetPositions.set(newTargets);
  }, [settings.shape, count, targetPositions]);

  const handPos = useMemo(() => new THREE.Vector3(), []);
  const particlePos = useMemo(() => new THREE.Vector3(), []);
  const particleVel = useMemo(() => new THREE.Vector3(), []);
  const targetPos = useMemo(() => new THREE.Vector3(), []);
  const diff = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    const positionsAttr = pointsRef.current.geometry.attributes.position;
    const posArray = positionsAttr.array as Float32Array;
    
    handPos.set(hand.x, hand.y, hand.z);

    const forceMul = hand.isFist ? -settings.forceStrength : settings.forceStrength;
    const radiusSq = settings.interactionRadius * settings.interactionRadius;

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      
      particlePos.set(posArray[idx], posArray[idx + 1], posArray[idx + 2]);
      particleVel.set(velocities[idx], velocities[idx + 1], velocities[idx + 2]);
      targetPos.set(targetPositions[idx], targetPositions[idx + 1], targetPositions[idx + 2]);

      // 1. Force towards target (spring physics)
      diff.subVectors(targetPos, particlePos);
      particleVel.addScaledVector(diff, settings.returnStrength);

      // 2. Hand Interaction
      if (hand.isActive) {
        diff.subVectors(particlePos, handPos);
        const distSq = diff.lengthSq();
        if (distSq < radiusSq) {
          const force = (1.0 - Math.sqrt(distSq) / settings.interactionRadius) * forceMul;
          // Normalize diff and apply force
          diff.normalize();
          particleVel.addScaledVector(diff, force);
        }
      }

      // 3. Damping
      particleVel.multiplyScalar(settings.damping);

      // 4. Update Position
      particlePos.add(particleVel);

      // Write back to arrays
      posArray[idx] = particlePos.x;
      posArray[idx + 1] = particlePos.y;
      posArray[idx + 2] = particlePos.z;

      velocities[idx] = particleVel.x;
      velocities[idx + 1] = particleVel.y;
      velocities[idx + 2] = particleVel.z;
    }

    positionsAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        vertexColors
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={0.8}
      />
    </points>
  );
};

export default Particles;

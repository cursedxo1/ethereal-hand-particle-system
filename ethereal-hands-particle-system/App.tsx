
import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Text, Environment } from '@react-three/drei';
import { ShapeType, AppSettings } from './types';
import Particles from './components/Particles';
import { useHandTracking } from './hooks/useHandTracking';

const App: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>({
    particleCount: 20000,
    forceStrength: 0.15,
    interactionRadius: 4.0,
    damping: 0.92,
    returnStrength: 0.02,
    shape: ShapeType.Sphere,
    color: '#00ffff'
  });

  const hand = useHandTracking();

  const handleShapeChange = (shape: ShapeType) => {
    setSettings(s => ({ ...s, shape }));
  };

  return (
    <div className="relative w-full h-full bg-black select-none">
      {/* 3D Scene */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
          <color attach="background" args={['#000000']} />
          <ambientLight intensity={0.5} />
          <Suspense fallback={null}>
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <Particles settings={settings} hand={hand} />
            <OrbitControls enablePan={false} maxDistance={40} minDistance={5} />
          </Suspense>
        </Canvas>
      </div>

      {/* Overlay UI */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 overflow-hidden">
        
        {/* Header */}
        <div className="pointer-events-auto">
          <h1 className="text-3xl font-light tracking-widest text-white/90 drop-shadow-lg">
            ETHEREAL <span className="font-bold text-cyan-400">HANDS</span>
          </h1>
          <p className="text-xs text-white/50 mt-1 uppercase tracking-widest">
            3D Spatial Interaction Lab
          </p>
        </div>

        {/* Hand Status Indicator */}
        <div className="absolute top-6 right-6 pointer-events-auto bg-black/40 backdrop-blur-md border border-white/10 p-4 rounded-xl flex items-center gap-4 transition-all duration-300">
            <div className={`w-3 h-3 rounded-full ${hand.isActive ? 'bg-green-500 shadow-[0_0_10px_green]' : 'bg-red-500'}`} />
            <div>
                <p className="text-[10px] text-white/40 uppercase font-bold tracking-tighter">Tracking Status</p>
                <p className="text-sm font-medium text-white/90">{hand.isActive ? 'Hand Detected' : 'No Hand Found'}</p>
            </div>
            {hand.isActive && (
                <div className="ml-4 pl-4 border-l border-white/10">
                    <p className="text-[10px] text-white/40 uppercase font-bold tracking-tighter">Current Gesture</p>
                    <p className="text-sm font-bold text-cyan-400">{hand.isFist ? 'FIST (PULL)' : 'OPEN (PUSH)'}</p>
                </div>
            )}
        </div>

        {/* Bottom UI: Shape Selector & Controls */}
        <div className="flex flex-col md:flex-row gap-6 items-end justify-between w-full pointer-events-auto pb-4">
          
          {/* Controls Panel */}
          <div className="w-full max-w-sm bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-white/80 text-sm font-bold mb-4 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                PARAMETER TUNING
            </h3>
            
            <div className="space-y-5">
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-white/60">
                  <span>Interaction Force</span>
                  <span>{settings.forceStrength.toFixed(2)}</span>
                </div>
                <input 
                  type="range" min="0.01" max="0.5" step="0.01" 
                  value={settings.forceStrength}
                  onChange={(e) => setSettings(s => ({ ...s, forceStrength: parseFloat(e.target.value) }))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-white/60">
                  <span>Detection Radius</span>
                  <span>{settings.interactionRadius.toFixed(1)}</span>
                </div>
                <input 
                  type="range" min="1" max="10" step="0.5" 
                  value={settings.interactionRadius}
                  onChange={(e) => setSettings(s => ({ ...s, interactionRadius: parseFloat(e.target.value) }))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-white/60">
                  <span>Return Force (Elasticity)</span>
                  <span>{settings.returnStrength.toFixed(3)}</span>
                </div>
                <input 
                  type="range" min="0.001" max="0.1" step="0.001" 
                  value={settings.returnStrength}
                  onChange={(e) => setSettings(s => ({ ...s, returnStrength: parseFloat(e.target.value) }))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs text-white/60 mb-2">
                  <span>Particle Color</span>
                </div>
                <div className="flex gap-2">
                    {['#00ffff', '#ff00ff', '#ffff00', '#ffffff', '#ff4d4d'].map(color => (
                        <button
                            key={color}
                            onClick={() => setSettings(s => ({ ...s, color }))}
                            className={`w-6 h-6 rounded-full border-2 transition-transform ${settings.color === color ? 'border-white scale-125' : 'border-transparent'}`}
                            style={{ backgroundColor: color }}
                        />
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Shape Grid */}
          <div className="grid grid-cols-4 gap-2 w-full max-w-lg">
            {Object.values(ShapeType).map((shape) => (
              <button
                key={shape}
                onClick={() => handleShapeChange(shape)}
                className={`
                  px-4 py-3 rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all duration-300 border
                  ${settings.shape === shape 
                    ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.5)]' 
                    : 'bg-black/40 text-white/60 border-white/5 hover:border-white/20 hover:bg-white/5'
                  }
                `}
              >
                {shape}
              </button>
            ))}
          </div>

        </div>

        {/* Instructions */}
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-20 text-center">
            <p className="text-4xl font-black uppercase tracking-[2em] text-white select-none whitespace-nowrap">
                MOVE YOUR HAND
            </p>
            <p className="text-sm tracking-[1em] text-white/60 mt-4">
                OPEN HAND PUSH • FIST PULL
            </p>
        </div>
      </div>
    </div>
  );
};

export default App;


import { useEffect, useRef, useState, useCallback } from 'react';
import { HandData } from '../types';

// We use the MediaPipe scripts via external CDN dynamically or assuming they are available
// For simplicity and ESM safety in this environment, we'll use the browser's script loading or a mock-like proxy if needed
// But here we implement the logic based on @mediapipe/tasks-vision

export const useHandTracking = () => {
  const [handData, setHandData] = useState<HandData>({ x: 0, y: 0, z: 0, isFist: false, isActive: false });
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const handsRef = useRef<any>(null);

  useEffect(() => {
    let active = true;
    const loadMediaPipe = async () => {
      try {
        // Dynamically import from CDN for ESM compatibility
        const vision = await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0');
        const { HandLandmarker, FilesetResolver } = vision;

        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );
        
        const handLandmarker = await HandLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        });
        
        handsRef.current = handLandmarker;

        const video = document.createElement('video');
        video.style.display = 'none';
        videoRef.current = video;

        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 640, height: 480 } 
        });
        video.srcObject = stream;
        video.play();

        const processVideo = () => {
          if (!active) return;
          if (video.readyState >= 2) {
            const results = handLandmarker.detectForVideo(video, performance.now());
            if (results.landmarks && results.landmarks.length > 0) {
              const landmarks = results.landmarks[0];
              
              // Normalize to center 0,0 and map to world coords roughly
              // MediaPipe X is 0-1 (right-to-left in selfie), Y is 0-1 (top-to-bottom)
              const x = (0.5 - landmarks[0].x) * 20; // 0 is wrist
              const y = (0.5 - landmarks[0].y) * 20; 
              const z = -landmarks[0].z * 10;

              // Simple Fist Detection: 
              // Distance from tip to base for all 4 fingers
              // Indices for tips: 8, 12, 16, 20
              // Indices for bases (MCP): 5, 9, 13, 17
              let closedFingers = 0;
              const fingerIndices = [
                [8, 5], [12, 9], [16, 13], [20, 17]
              ];
              
              fingerIndices.forEach(([tip, base]) => {
                const dx = landmarks[tip].x - landmarks[base].x;
                const dy = landmarks[tip].y - landmarks[base].y;
                const dz = landmarks[tip].z - landmarks[base].z;
                const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
                // Heuristic: if tip is very close to base, finger is curled
                if (dist < 0.12) closedFingers++;
              });

              setHandData({
                x, y, z,
                isFist: closedFingers >= 3,
                isActive: true
              });
            } else {
              setHandData(prev => ({ ...prev, isActive: false }));
            }
          }
          requestAnimationFrame(processVideo);
        };

        processVideo();
      } catch (err) {
        console.error("Hand tracking error:", err);
      }
    };

    loadMediaPipe();
    return () => { active = false; };
  }, []);

  return handData;
};

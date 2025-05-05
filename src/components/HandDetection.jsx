import React, { useRef, useEffect, useState } from 'react';
import * as handpose from '@tensorflow-models/handpose';

const HandDetection = ({ onHandsDetected, videoRef, canvasRef }) => {
  const [handposeModel, setHandposeModel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load HandPose model on component mount
  useEffect(() => {
    async function loadModel() {
      try {
        setIsLoading(true);
        const model = await handpose.load();
        setHandposeModel(model);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading handpose model:', error);
        setIsLoading(false);
      }
    }
    
    loadModel();
  }, []);
  
  // Set up webcam
  useEffect(() => {
    if (!videoRef.current) return;
    
    async function setupCamera() {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
              facingMode: 'user',
              width: 640,
              height: 480
            }
          });
          
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error accessing webcam:', error);
        }
      }
    }
    
    setupCamera();
    
    // Cleanup
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [videoRef]);
  
  // Run hand detection
  useEffect(() => {
    if (!handposeModel || !videoRef.current) return;
    
    let animationFrameId;
    
    const detectHands = async () => {
      try {
        if (videoRef.current.readyState === 4) {
          // Detect hands
          const hands = await handposeModel.estimateHands(videoRef.current);
          
          // Call the callback with hand detection results
          onHandsDetected(hands.length > 0, hands);
          
          // Draw hand landmarks if canvas is provided
          if (canvasRef && canvasRef.current && hands.length > 0) {
            drawHandLandmarks(hands);
          }
        }
      } catch (error) {
        console.error('Error in hand detection:', error);
      }
      
      // Continue detection loop
      animationFrameId = requestAnimationFrame(detectHands);
    };
    
    detectHands();
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [handposeModel, videoRef, canvasRef, onHandsDetected]);
  
  // Draw hand landmarks on canvas
  const drawHandLandmarks = (hands) => {
    if (!canvasRef || !canvasRef.current) return;
    
    const ctx = canvasRef.current.getContext('2d');
    const video = videoRef.current;
    
    // Set canvas dimensions
    canvasRef.current.width = video.videoWidth;
    canvasRef.current.height = video.videoHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    // Draw landmarks
    hands.forEach(hand => {
      // Draw keypoints
      hand.landmarks.forEach(point => {
        ctx.beginPath();
        ctx.arc(point[0], point[1], 5, 0, 2 * Math.PI);
        ctx.fillStyle = 'red';
        ctx.fill();
      });
      
      // Draw skeleton (connections between points)
      // Finger connections
      const fingers = [
        [0, 1, 2, 3, 4],          // thumb
        [0, 5, 6, 7, 8],          // index finger
        [0, 9, 10, 11, 12],       // middle finger
        [0, 13, 14, 15, 16],      // ring finger
        [0, 17, 18, 19, 20]       // pinky
      ];
      
      fingers.forEach(finger => {
        for (let i = 1; i < finger.length; i++) {
          const point1 = hand.landmarks[finger[i - 1]];
          const point2 = hand.landmarks[finger[i]];
          
          ctx.beginPath();
          ctx.moveTo(point1[0], point1[1]);
          ctx.lineTo(point2[0], point2[1]);
          ctx.strokeStyle = 'blue';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });
    });
  };
  
  return (
    <div className="hand-detection">
      {isLoading && <div className="loading-overlay">Loading hand detection model...</div>}
    </div>
  );
};

export default HandDetection;
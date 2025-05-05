import React, { useState, useRef, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as handpose from '@tensorflow-models/handpose';
import './ASLGame.css'; // We'll create this later

const ASLGame = () => {
  // State variables
  const [model, setModel] = useState(null);
  const [handposeModel, setHandposeModel] = useState(null);
  const [currentLetter, setCurrentLetter] = useState(null);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [handDetected, setHandDetected] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  // Class labels (adjust based on your model's classes)
  const classLabels = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 
    'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
  ];

    // Load models on component mount
    useEffect(() => {
        async function loadModels() {
        try {
            setIsModelLoading(true);
            
            // Load TFJS model
            const aslModel = await tf.loadLayersModel('/tfjs_model/model.json');
            setModel(aslModel);
            
            // Load handpose for hand detection
            const handModel = await handpose.load();
            setHandposeModel(handModel);
            
            // Select random letter to start
            selectRandomLetter();
            
            setIsModelLoading(false);
        } catch (error) {
            console.error('Error loading models:', error);
            setIsModelLoading(false);
        }
        }
        
        // Start webcam and load models
        setupWebcam();
        loadModels();
        
        // Cleanup function
        return () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
        }
        };
    }, []);
    
    // Set up webcam stream
    const setupWebcam = async () => {
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
    };
    
    // Select a random letter/number to practice
    const selectRandomLetter = () => {
        const randomIndex = Math.floor(Math.random() * classLabels.length);
        setCurrentLetter(classLabels[randomIndex]);
        setAttempts(0);
        setShowHint(false);
        setPrediction(null);
    };
    
    // Run detection on video frames
    useEffect(() => {
        if (!model || !handposeModel || !videoRef.current || isModelLoading) return;
        
        let animationFrameId;
        let processingInterval;
        
        const detectHands = async () => {
        if (!videoRef.current || isProcessing) {
            animationFrameId = requestAnimationFrame(detectHands);
            return;
        }
        
        try {
            // Detect hands
            const hands = await handposeModel.estimateHands(videoRef.current);
            
            if (hands.length > 0) {
            setHandDetected(true);
            } else {
            setHandDetected(false);
            animationFrameId = requestAnimationFrame(detectHands);
            return;
            }
            
            // Continue detection loop
            animationFrameId = requestAnimationFrame(detectHands);
        } catch (error) {
            console.error('Error in hand detection:', error);
            animationFrameId = requestAnimationFrame(detectHands);
        }
        };
        
        // Start hand detection loop
        detectHands();
        
        // Process hand for ASL recognition at intervals
        processingInterval = setInterval(() => {
        if (handDetected && !isProcessing) {
            processHandForASL();
        }
        }, 1000); // Process every second
        
        return () => {
        cancelAnimationFrame(animationFrameId);
        clearInterval(processingInterval);
        };
    }, [model, handposeModel, handDetected, isProcessing, isModelLoading]);
    
    // Process hand image for ASL recognition
    const processHandForASL = async () => {
        if (!videoRef.current || !canvasRef.current || !model || !handDetected) return;
        
        setIsProcessing(true);
        
        try {
        // Capture and process image
        const imageData = captureImageFromVideo();
        if (imageData) {
            const prediction = await predictASL(imageData);
            setPrediction(prediction);
            
            // Check if correct with 70% confidence
            if (prediction.label === currentLetter && prediction.confidence > 0.7) {
            // Correct!
            setScore(prev => prev + 1);
            // Wait a bit and then show next letter
            setTimeout(selectRandomLetter, 1500);
            } else {
            // Increment attempts
            setAttempts(prev => prev + 1);
            }
        }
        } catch (error) {
        console.error('Error processing hand:', error);
        } finally {
        setIsProcessing(false);
        }
    };
    
    // Capture image from video
    const captureImageFromVideo = () => {
        if (!videoRef.current || !canvasRef.current) return null;
        
        const canvas = canvasRef.current;
        const video = videoRef.current;
        const ctx = canvas.getContext('2d');
        
        // Set canvas dimensions
        canvas.width = 50;
        canvas.height = 50;
        
        // Draw video frame to canvas (resized to 50x50)
        ctx.drawImage(video, 0, 0, 50, 50);
        
        // Get image data
        return ctx.getImageData(0, 0, 50, 50);
    };
    
    // Predict ASL sign from image
    const predictASL = async (imageData) => {
        if (!model) return null;
        
        try {
        // Preprocess image (normalize)
        const tensor = tf.browser.fromPixels(imageData)
            .div(255.0)
            .expandDims(0);
        
        // Run prediction
        const predictions = await model.predict(tensor).data();
        
        // Get the predicted class
        const predIndex = tf.argMax(predictions).dataSync()[0];
        const confidence = predictions[predIndex];
        
        // Cleanup
        tensor.dispose();
        
        return {
            label: classLabels[predIndex],
            confidence: confidence
        };
        } catch (error) {
        console.error('Error in ASL prediction:', error);
        return null;
        }
    };
    
    // Show hint after 3 attempts
    useEffect(() => {
        if (attempts >= 3) {
        setShowHint(true);
        }
    }, [attempts]);
  
  // Component render
  return (
    <div className="asl-game">
      <div className="game-header">
        <h2>Learn ASL</h2>
        <div className="score">Score: {score}</div>
      </div>
      
      {isModelLoading ? (
        <div className="loading">Loading models...</div>
      ) : (
        <div className="game-content">
          <div className="letter-display">
            <h3>Sign the letter: {currentLetter}</h3>
            {showHint && (
              <div className="hint">
                <p>Hint:</p>
                <img 
                  src={`/asl_images/${currentLetter}.jpg`} 
                  alt={`ASL sign for ${currentLetter}`} 
                />
              </div>
            )}
          </div>
          
          <div className="video-container">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="webcam-video"
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            
            {!handDetected && (
              <div className="hand-prompt">
                Please show your hand in the frame
              </div>
            )}
            
            {prediction && (
              <div className="prediction">
                Detected: {prediction.label} 
                (Confidence: {Math.round(prediction.confidence * 100)}%)
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="game-controls">
        {attempts >= 3 && !showHint && (
          <button onClick={() => setShowHint(true)}>
            Get Hint
          </button>
        )}
        <button onClick={() => selectRandomLetter()}>
          Skip
        </button>
      </div>
    </div>
  );
};

export default ASLGame;
import React, { useState, useRef, useEffect } from 'react';
import { Card, Button, Progress, Typography } from 'antd';
import HandDetection from './HandDetection';
import ASLModel from './ASLModel';
import './ASLGame.css';

const { Title, Text } = Typography;

const ASLGame = () => {
  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const processingCanvasRef = useRef(null);
  
  // State
  const [currentLetter, setCurrentLetter] = useState(null);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [handDetected, setHandDetected] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [predictFunction, setPredictFunction] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modelError, setModelError] = useState(null);
  
  // Class labels
  const classLabels = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 
    'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
  ];
  
  // Handle model loading
  const handleModelLoaded = (success, error, predictionFn) => {
    if (success) {
      setModelLoaded(true);
      if (predictionFn) {
        setPredictFunction(() => predictionFn);
      }
    } else {
      setModelError(error || 'Failed to load ASL model');
    }
  };
  
  // Handle hand detection
  const handleHandsDetected = (detected, hands) => {
    setHandDetected(detected);
    
    // If hands are detected and we're not currently processing,
    // process the image for ASL detection at a reasonable rate
    if (detected && !isProcessing && modelLoaded && predictFunction) {
      processHandForASL();
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
  
  // Initialize game when models are loaded
  useEffect(() => {
    if (modelLoaded && currentLetter === null) {
      selectRandomLetter();
    }
  }, [modelLoaded, currentLetter]);
  
  // Process hand for ASL recognition
  const processHandForASL = async () => {
    if (!videoRef.current || !processingCanvasRef.current || !predictFunction || !handDetected) return;
    
    setIsProcessing(true);
    
    try {
      // Capture and process image
      const imageData = captureImageFromVideo();
      if (imageData) {
        const result = await predictFunction(imageData);
        setPrediction(result);
        
        // Check if correct with 70% confidence
        if (result && result.label === currentLetter && result.confidence > 0.7) {
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
      // Add a small delay before allowing next processing
      setTimeout(() => {
        setIsProcessing(false);
      }, 500);
    }
  };
  
  // Capture image from video
  const captureImageFromVideo = () => {
    if (!videoRef.current || !processingCanvasRef.current) return null;
    
    const canvas = processingCanvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions to match model input size (50x50)
    canvas.width = 50;
    canvas.height = 50;
    
    // Draw video frame to canvas (resized to 50x50)
    ctx.drawImage(video, 0, 0, 50, 50);
    
    // Get image data
    return ctx.getImageData(0, 0, 50, 50);
  };
  
  // Show hint after 3 attempts
  useEffect(() => {
    if (attempts >= 3) {
      setShowHint(true);
    }
  }, [attempts]);
  
  return (
    <div className="asl-game">
      <Card className="game-card">
        <div className="game-header">
          <Title level={3}>ASL Recognition Game</Title>
          <div className="score">Score: {score}</div>
        </div>
        
        {modelError ? (
          <div className="error-message">
            <Text type="danger">{modelError}</Text>
            <Button onClick={() => window.location.reload()}>Reload</Button>
          </div>
        ) : !modelLoaded ? (
          <div className="loading-container">
            <Text>Loading models...</Text>
            <Progress percent={30} status="active" />
          </div>
        ) : (
          <div className="game-content">
            <div className="letter-display">
              <Title level={4}>Sign the letter: {currentLetter}</Title>
              {showHint && (
                <div className="hint">
                  <Text>Hint:</Text>
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
              <canvas 
                ref={canvasRef} 
                className="hand-canvas"
              />
              <canvas 
                ref={processingCanvasRef} 
                style={{ display: 'none' }} 
              />
              
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
            
            <div className="game-controls">
              {attempts >= 3 && !showHint && (
                <Button onClick={() => setShowHint(true)}>
                  Get Hint
                </Button>
              )}
              <Button onClick={selectRandomLetter}>
                Skip
              </Button>
            </div>
          </div>
        )}
      </Card>
      
      {/* Hidden components for functionality */}
      <HandDetection 
        onHandsDetected={handleHandsDetected} 
        videoRef={videoRef} 
        canvasRef={canvasRef} 
      />
      <ASLModel 
        onModelLoaded={handleModelLoaded} 
      />
    </div>
  );
};

export default ASLGame;
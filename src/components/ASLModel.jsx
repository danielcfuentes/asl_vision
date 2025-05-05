import React, { useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';

const ASLModel = ({ onModelLoaded, onPrediction }) => {
  const [model, setModel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Class labels for our model
  const classLabels = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 
    'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
  ];
  
  // Load model on component mount
  useEffect(() => {
    async function loadModel() {
      try {
        setIsLoading(true);
        
        // Load the TFJS model
        const loadedModel = await tf.loadLayersModel('/tfjs_model/model.json');
        setModel(loadedModel);
        
        // Call the callback when model is loaded
        if (onModelLoaded) {
          onModelLoaded(true);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading ASL model:', error);
        if (onModelLoaded) {
          onModelLoaded(false, error.message);
        }
        setIsLoading(false);
      }
    }
    
    loadModel();
  }, [onModelLoaded]);
  
  // Predict ASL sign from image data
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
      
      // Create prediction result
      const result = {
        label: classLabels[predIndex],
        confidence: confidence,
        allPredictions: Array.from(predictions)
      };
      
      // Call the callback with prediction result
      if (onPrediction) {
        onPrediction(result);
      }
      
      return result;
    } catch (error) {
      console.error('Error in ASL prediction:', error);
      return null;
    }
  };
  
  // Expose the predict function
  useEffect(() => {
    if (!model) return;
    
    // Make the prediction function available to parent component
    if (typeof onModelLoaded === 'function') {
      onModelLoaded(true, null, predictASL);
    }
  }, [model, onModelLoaded]);
  
  return (
    <div className="asl-model">
      {isLoading && <div className="loading-message">Loading ASL recognition model...</div>}
    </div>
  );
};

export default ASLModel;
import React, { useRef, useEffect, useState } from 'react';

const WebcamAccess = () => {
  const videoRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true,
          audio: false 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsStreaming(true);
        }
      } catch (err) {
        setError('Failed to access webcam: ' + err.message);
        console.error('Webcam error:', err);
      }
    };

    startWebcam();

    // Cleanup function
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">React Webcam Access</h1>
      
      {error && (
        <div className="text-red-500 mb-4">
          {error}
        </div>
      )}
      
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full max-w-2xl rounded-lg shadow-lg"
      />
      
      {isStreaming && (
        <p className="mt-4 text-green-600">
          Webcam is streaming!
        </p>
      )}
    </div>
  );
};

export default WebcamAccess;
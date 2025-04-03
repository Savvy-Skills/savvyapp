'use dom'

import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

interface ImagePixelExtractorProps {
  imageUri: string | null;
  width?: number;
  height?: number;
  onPixelDataExtracted?: (
    rgbValues: Array<[number, number, number]>,
    grayscaleValues: number[]
  ) => void;
  onError?: (error: string) => void;
}

export interface ImagePixelExtractorHandle {
  extractPixelData: (imageUri: string) => Promise<void>;
}

const ImagePixelExtractor = forwardRef<ImagePixelExtractorHandle, ImagePixelExtractorProps>(
  ({ imageUri, width = 30, height = 30, onPixelDataExtracted, onError }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const extractPixelData = async (uri: string): Promise<void> => {
      return new Promise((resolve) => {
        const canvas = canvasRef.current;
        if (!canvas) {
          if (onError) onError("Canvas not available");
          resolve();
          return;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          if (onError) onError("Canvas context not available");
          resolve();
          return;
        }

        const img = new Image();
        img.crossOrigin = "Anonymous"; // Handle CORS issues
        
        img.onload = () => {
          // Set canvas dimensions to target size
          canvas.width = width;
          canvas.height = height;
          
          // Draw image resized to our target dimensions
          ctx.drawImage(img, 0, 0, width, height);
          
          try {
            // Get image data
            const imageData = ctx.getImageData(0, 0, width, height);
            const data = imageData.data;
            
            const rgbArray: Array<[number, number, number]> = [];
            const grayscaleArray: number[] = [];
            
            // Process pixel data (RGBA format)
            for (let i = 0; i < data.length; i += 4) {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              
              rgbArray.push([r, g, b]);
              
              // Calculate grayscale value (average of RGB, normalized to 0-1)
              const gray = (r + g + b) / (3 * 255);
              grayscaleArray.push(gray);
            }
            
            // Pass data back through callback
            if (onPixelDataExtracted) {
              onPixelDataExtracted(rgbArray, grayscaleArray);
            }
          } catch (error) {
            if (onError) onError(`Error extracting pixel data: ${error}`);
          }
          
          resolve();
        };
        
        img.onerror = () => {
          if (onError) onError("Failed to load image");
          resolve();
        };
        
        img.src = uri;
      });
    };

    // Process the image whenever imageUri changes
    useEffect(() => {
      if (imageUri) {
        extractPixelData(imageUri);
      }
    }, [imageUri]);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      extractPixelData
    }));

    return (
      <canvas 
        ref={canvasRef}
        style={{ display: 'none' }} // Hidden canvas, only used for processing
      />
    );
  }
);

export default ImagePixelExtractor; 
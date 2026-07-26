"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import styles from "./ImageCropper.module.css";
import { ZoomIn, ZoomOut, Check, X } from "lucide-react";

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedBlob: Blob) => void;
  onCancel: () => void;
}

export default function ImageCropper({ imageSrc, onCropComplete, onCancel }: ImageCropperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  
  const [scale, setScale] = useState(1);
  const [minScale, setMinScale] = useState(1);
  
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastOffset, setLastOffset] = useState({ x: 0, y: 0 });

  const CROP_SIZE = 300; // Fixed size for the cropped area

  useEffect(() => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      setImage(img);
      // Calculate initial scale to cover the crop area
      const initialScale = Math.max(CROP_SIZE / img.width, CROP_SIZE / img.height);
      setMinScale(initialScale);
      setScale(initialScale);
      
      // Center the image initially
      setOffset({
        x: (CROP_SIZE - img.width * initialScale) / 2,
        y: (CROP_SIZE - img.height * initialScale) / 2,
      });
      setLastOffset({
        x: (CROP_SIZE - img.width * initialScale) / 2,
        y: (CROP_SIZE - img.height * initialScale) / 2,
      });
    };
  }, [imageSrc]);

  const drawImage = useCallback(() => {
    if (!canvasRef.current || !image) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle high-DPI displays for sharp rendering
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    if (canvas.width !== CROP_SIZE * dpr || canvas.height !== CROP_SIZE * dpr) {
      canvas.width = CROP_SIZE * dpr;
      canvas.height = CROP_SIZE * dpr;
      canvas.style.width = `${CROP_SIZE}px`;
      canvas.style.height = `${CROP_SIZE}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // Clear canvas
    ctx.clearRect(0, 0, CROP_SIZE, CROP_SIZE);

    // Fill background
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, CROP_SIZE, CROP_SIZE);

    // Draw the image with current scale and offset
    ctx.drawImage(
      image,
      offset.x,
      offset.y,
      image.width * scale,
      image.height * scale
    );

    // Draw circular overlay for preview (optional, if we want circular avatar)
    ctx.globalCompositeOperation = "destination-in";
    ctx.beginPath();
    ctx.arc(CROP_SIZE / 2, CROP_SIZE / 2, CROP_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";

  }, [image, offset, scale]);

  useEffect(() => {
    drawImage();
  }, [drawImage]);

  const constrainOffset = (newX: number, newY: number, currentScale: number) => {
    if (!image) return { x: newX, y: newY };
    
    const scaledWidth = image.width * currentScale;
    const scaledHeight = image.height * currentScale;

    // Image must always cover the CROP_SIZE area
    const maxX = 0;
    const minX = CROP_SIZE - scaledWidth;
    
    const maxY = 0;
    const minY = CROP_SIZE - scaledHeight;

    return {
      x: Math.min(Math.max(newX, minX), maxX),
      y: Math.min(Math.max(newY, minY), maxY),
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDragging || !image) return;
    
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    
    const newOffset = constrainOffset(lastOffset.x + dx, lastOffset.y + dy, scale);
    setOffset(newOffset);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    setIsDragging(false);
    setLastOffset(offset);
  };

  const handleZoom = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newScale = parseFloat(e.target.value);
    setScale(newScale);
    
    // Adjust offset to keep center focus (roughly)
    if (image) {
      const newOffset = constrainOffset(offset.x, offset.y, newScale);
      setOffset(newOffset);
      setLastOffset(newOffset);
    }
  };

  const handleSave = () => {
    if (!canvasRef.current) return;

    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

    // Create an offscreen canvas sized according to devicePixelRatio for high-DPI exports
    const offscreen = document.createElement("canvas");
    offscreen.width = Math.round(CROP_SIZE * dpr);
    offscreen.height = Math.round(CROP_SIZE * dpr);
    const ctx = offscreen.getContext("2d");
    if (!ctx || !image) return;

    // Scale drawing so we render at device pixels
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Fill white background just in case
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, CROP_SIZE, CROP_SIZE);

    ctx.drawImage(
      image,
      offset.x,
      offset.y,
      image.width * scale,
      image.height * scale
    );

    offscreen.toBlob(
      (blob) => {
        if (blob) {
          onCropComplete(blob);
        }
      },
      "image/jpeg",
      0.9
    );
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3>Crop Image</h3>
          <button type="button" className={styles.iconButton} onClick={onCancel} aria-label="Cancel">
            <X size={20} />
          </button>
        </div>
        
        <div className={styles.canvasContainer}>
          <canvas
            ref={canvasRef}
            width={CROP_SIZE}
            height={CROP_SIZE}
            className={styles.canvas}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{ touchAction: "none" }}
          />
        </div>

        <div className={styles.controls}>
          <ZoomOut size={18} className={styles.icon} />
          <input
            type="range"
            min={minScale}
            max={minScale * 3}
            step="0.01"
            value={scale}
            onChange={handleZoom}
            className={styles.slider}
          />
          <ZoomIn size={18} className={styles.icon} />
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.cancelButton} onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className={styles.saveButton} onClick={handleSave}>
            <Check size={18} />
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

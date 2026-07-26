"use client";

import React from "react";
import { Plus, Minus } from "lucide-react";
import styles from "./MapControls.module.css";

interface MapControlsProps {
  zoom: number;
  onZoom: (direction: "in" | "out") => void;
}

export default function MapControls({
  zoom,
  onZoom,
}: MapControlsProps) {
  return (
    <div className={styles.controls}>
      <button
        className={styles.button}
        onClick={() => onZoom("in")}
        disabled={zoom >= 18}
        title="Zoom in"
        aria-label="Zoom in"
      >
        <Plus size={20} strokeWidth={2.5} />
      </button>

      <div className={styles.zoomDisplay}>
        {zoom}
      </div>

      <button
        className={styles.button}
        onClick={() => onZoom("out")}
        disabled={zoom <= 1}
        title="Zoom out"
        aria-label="Zoom out"
      >
        <Minus size={20} strokeWidth={2.5} />
      </button>
    </div>
  );
}

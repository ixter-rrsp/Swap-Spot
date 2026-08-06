interface FilledIconProps {
  size?: number;
}

/**
 * A "filled" home icon that actually reads as a house rather than a
 * solid blob — the door is cut all the way through to the bottom edge
 * as part of the outline itself (same trick Material Symbols' filled
 * "home" glyph uses), not just an overlay.
 */
export function FilledHouse({ size = 22 }: FilledIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2.3 L21 9.8 V20 a1.3 1.3 0 0 1 -1.3 1.3 H14.5 V15.3 a0.8 0.8 0 0 0 -0.8 -0.8 H10.3 a0.8 0.8 0 0 0 -0.8 0.8 V21.3 H4.3 A1.3 1.3 0 0 1 3 20 V9.8 Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * A "filled" compass — the outer ring is solid, and the needle is cut
 * out in white on top (rather than drawn as a stroke) so it stays
 * legible instead of disappearing into a solid circle. Needle geometry
 * matches lucide's own Compass icon so it lines up with the outline
 * version when toggling active/inactive.
 */
export function FilledCompass({ size = 22 }: FilledIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <polygon
        points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"
        fill="#ffffff"
      />
    </svg>
  );
}

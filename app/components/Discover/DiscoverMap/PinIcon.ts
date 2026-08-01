import L from "leaflet";
import { Listing } from "@/lib/types/Listing";

// Lucide's "map-pin" icon markup, inlined so the Leaflet divIcon has no
// runtime dependency on React/lucide-react.
function mapPinSvg(color: string, size: number): string {
  return `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="${size}"
      height="${size}"
      viewBox="0 0 24 24"
      fill="none"
      stroke="${color}"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  `;
}

// Builds a self-contained Leaflet divIcon showing the listing's own
// image as the pin, with no dependency on ListingPin's old overlay CSS.
export function buildPinIcon(listing: Listing, isSelected: boolean): L.DivIcon {
  const borderColor = isSelected ? "#2563eb" : "#65a30d";
  const size = isSelected ? 48 : 40;
  const imageUrl = listing.imageUrl || "";

  const imageHtml = imageUrl
    ? `<img src="${imageUrl}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`
    : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;">${mapPinSvg(
        borderColor,
        Math.round(size * 0.5)
      )}</div>`;

  return L.divIcon({
    className: "",
    html: `
      <div style="
        width:${size}px;
        height:${size}px;
        border-radius:50%;
        background:white;
        border:3px solid ${borderColor};
        box-shadow:0 2px 8px rgba(0,0,0,0.2);
        overflow:hidden;
        display:flex;
        align-items:center;
        justify-content:center;
        cursor:pointer;
        transition: width 0.15s ease, height 0.15s ease;
      ">
        ${imageHtml}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

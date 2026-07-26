import L from "leaflet";
import { Listing } from "@/lib/types/Listing";

// Builds a self-contained Leaflet divIcon showing the listing's own
// image as the pin, with no dependency on ListingPin's old overlay CSS.
export function buildPinIcon(listing: Listing, isSelected: boolean): L.DivIcon {
  const borderColor = isSelected ? "#2563eb" : "#65a30d";
  const size = isSelected ? 48 : 40;
  const imageUrl = listing.imageUrl || "";

  const imageHtml = imageUrl
    ? `<img src="${imageUrl}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`
    : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:18px;">📍</div>`;

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
"use client";
import { useState } from "react";
import { Button } from "antd";
import { LatLngTuple } from "leaflet";

interface CaptureLocationProps {
  onLocationChange?: (location: { latitude: number; longitude: number }) => void;
}

const CaptureLocation: React.FC<CaptureLocationProps> = ({ onLocationChange }) => {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const position: LatLngTuple = location ? [location.lat, location.lng] : [51.505, -0.09];

  const handleCaptureLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        if (onLocationChange) {
          onLocationChange({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        }
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  return (
    <div className="mt-4">
      <label htmlFor="capture-location">Location</label>
      <div className="flex gap-2 mb-2">
        <Button onClick={handleCaptureLocation}>Location</Button>
        {location && (
          <span className="text-[#364663]">
            Lat: {location.lat}, Lng: {location.lng}
          </span>
        )}
      </div>
    </div>
  );
};

export default CaptureLocation;
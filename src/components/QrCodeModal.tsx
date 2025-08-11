import React, { useEffect, useState, useRef } from "react";
import { IoClose } from "react-icons/io5";
import { LuQrCode, LuZap, LuZapOff } from "react-icons/lu";
import { BrowserMultiFormatReader, DecodeHintType } from '@zxing/library';
import Button from "./ui/Button";
import QRScanner from "./QRScanner";

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (result: string) => void; 
}

const QrCodeModal: React.FC<QrCodeModalProps> = ({ isOpen, onClose, onScan }) => {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isFlashlightOn, setIsFlashlightOn] = useState<boolean>(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const checkIsMobile = (): void => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

const handleQrResult = (result: string) => {
    if (result) {
      onScan(result);
    }
  };



  const toggleFlashlight = async (): Promise<void> => {
    if (!stream) return;

    try {
      const videoTrack = stream.getVideoTracks()[0];
      // Check if the track has capabilities and if torch is supported
      const capabilities = videoTrack.getCapabilities && videoTrack.getCapabilities();

      if (capabilities && capabilities.torch) {
        await videoTrack.applyConstraints({
          advanced: [{ torch: !isFlashlightOn }]
        });
        setIsFlashlightOn(!isFlashlightOn);
      } else {
        setError("Flashlight not supported on this device");
        setTimeout(() => setError(""), 3000);
      }
    } catch (err) {
      console.error("Error toggling flashlight:", err);
      setError("Unable to control flashlight");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleClose = (): void => {
    onClose();
  };

  if (!isOpen) return null;
    const qrScanner = isOpen ? <QRScanner onResult={handleQrResult} /> : null;
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={handleBackdropClick}
      />

      {/* Modal */}
      <div
        className={`
        fixed z-50 bg-white
        ${
          isMobile
            ? "inset-0 flex flex-col"
            : "top-0 right-0 h-full w-96 shadow-2xl transform transition-transform duration-300 ease-in-out"
        }
        ${
          isOpen
            ? isMobile
              ? ""
              : "translate-x-0"
            : isMobile
            ? ""
            : "translate-x-full"
        }
      `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-white border-b">
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <IoClose size={24} />
          </button>
          <h2 className="text-lg font-semibold">Check in with QR code</h2>
          <div></div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-white relative">
          {error && (
            <div className="absolute top-4 left-4 right-4 bg-red-500  p-3 rounded-lg text-sm z-10">
              {error}
            </div>
          )}

          <div className="text-center mb-4">
            <p className=" mb-6 text-sm">
              Place the QR code properly inside the frame
            </p>

            {/* QR Scanner Frame */}
            <div
              className="relative mx-auto mb-6"
              style={{ width: "280px", height: "280px" }}
            >
            <div>{qrScanner}</div>
              {/* Loading overlay */}
              {isLoading && (
                <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center rounded-lg">
                  <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                    <p className="text-sm">Starting camera...</p>
                  </div>
                </div>
              )}

              {/* Error state */}
              {error && !isLoading && (
                <div className="absolute inset-0 bg-gray-800 flex items-center justify-center rounded-lg">
                  <div className="text-white text-center p-4">
                    <LuQrCode size={48} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Camera unavailable</p>
                  </div>
                </div>
              )}
              
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full space-y-4 flex flex-col items-center">
           <Button
  onClick={toggleFlashlight}
  className={`text-center  py-3 px-3 rounded-full font-medium !gap-0 transition-colors ${
    isFlashlightOn
      ? 'bg-yellow-500 hover:bg-yellow-600'
      : 'bg-gray-600 hover:bg-gray-700'
  }`}
  icon={isFlashlightOn ?
    <LuZap className="text-white text-xl"/> :
    <LuZapOff className="text-white text-xl"/>
  }
/>
            <span className="text-white text-sm">
              {isFlashlightOn ? "Click to turn off flashlight" : "Click to turn on flashlight"}Flashlight {isFlashlightOn ? 'on' : 'off'}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default QrCodeModal;
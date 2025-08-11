import QrScanner from "qr-scanner";
import { useEffect, useRef, useState } from "react";

interface QRScannerProps {
  onResult?: (result: string) => void;
}

const QRScanner = ({ onResult }: QRScannerProps) => {
  const videoElementRef = useRef<HTMLVideoElement>(null);
  const [scanned, setScannedText] = useState("");

  useEffect(() => {
    const video = videoElementRef.current;

    if (!video) return;

    const qrScanner = new QrScanner(
      video,
      (result) => {
        console.log("decoded qr code:", result);
        setScannedText(result.data);
        if (onResult) {
          onResult(result.data); 
        }
      },
      {
        returnDetailedScanResult: true,
        highlightScanRegion: true,
        highlightCodeOutline: true,
      }
    );

    qrScanner.start();
    console.log("start");

    return () => {
      console.log(qrScanner);
      qrScanner.stop();
      qrScanner.destroy();
    };
  }, [onResult]);

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center justify-center mb-2">
        <video
          ref={videoElementRef}
          width={280}
          height={280}
          className="w-[280px] h-[280px] object-cover rounded-lg border border-gray-300"
        />
      </div>
      <p className="break-words text-center font-medium">SCANNED: {scanned}</p>
    </div>
  );
};

export default QRScanner;

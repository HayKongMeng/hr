import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children,className }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth < 768);
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40F"
        onClick={handleBackdropClick}
      />
      <div
        className={`
          fixed z-50 bg-white
          ${isMobile ? "inset-0 flex flex-col" : "top-0 right-0 h-full w-96 shadow-2xl"}
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? (isMobile ? "" : "translate-x-0") : (isMobile ? "" : "translate-x-full")}
        `}
      >
        <div className="flex items-center justify-between p-4 bg-white">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <IoClose size={24} />
          </button>
          {title && <h2 className="text-lg font-semibold">{title}</h2>}
          <div></div>
        </div>
       <div className={`flex-1 ${className} overflow-y-auto`} style={{ maxHeight: isMobile ? "calc(100vh - 56px)" : "100vh" }}>
  {children}
</div>
      </div>
    </>
  );
};

export default Modal;
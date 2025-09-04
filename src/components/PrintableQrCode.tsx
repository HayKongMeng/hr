"use client";

import React from 'react';
import { QRCode } from 'antd';

interface PrintableQrCodeProps {
    companyName: string;
    scanCode: string;
}

const PrintableQrCode = React.forwardRef<HTMLDivElement, PrintableQrCodeProps>(
    ({ companyName, scanCode }, ref) => {
        if (!scanCode) {
            return (
                <div ref={ref} className="p-10 text-center">
                    <h1 className="text-2xl font-bold mb-4">{companyName}</h1>
                    <p className="text-lg text-red-500">No Scan Code available.</p>
                </div>
            );
        }

        return (
            <div ref={ref} className="p-10 flex flex-col items-center justify-center bg-white text-black">
                <h1 className="text-2xl font-bold mb-4">{companyName}</h1>
                <QRCode
                    value={scanCode}
                    size={256}
                    bgColor="#fff"
                />
                <p className="mt-4 text-gray-700">Scan for Attendance</p>
            </div>
        );
    });

PrintableQrCode.displayName = 'PrintableQrCode';

export default PrintableQrCode;
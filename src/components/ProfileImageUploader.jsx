'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { CiImageOn } from "react-icons/ci";

const ProfileImageUploader = ({ initialFile = null, onFileChange }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
    const [isImageUploaded, setIsImageUploaded] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (initialFile instanceof File || typeof initialFile === 'string') {
            if (initialFile instanceof File) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    if (typeof reader.result === "string") {
                        setImagePreviewUrl(reader.result);
                    }
                };
                reader.readAsDataURL(initialFile);
            } else {
                setImagePreviewUrl(initialFile);
            }
            setSelectedFile(initialFile);
            setIsImageUploaded(true);
        } else {
            resetImage();
        }
    }, [initialFile]);

    const resetImage = () => {
        setSelectedFile(null);
        setImagePreviewUrl(null);
        setIsImageUploaded(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        onFileChange?.(null);
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return resetImage();

        if (!file.type.startsWith('image/')) {
            alert('Please select a valid image file.');
            return resetImage();
        }

        if (file.size > 4 * 1024 * 1024) {
            alert('Image should be below 4 MB.');
            return resetImage();
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === "string") {
                setImagePreviewUrl(reader.result);
            }
        };
        reader.readAsDataURL(file);

        setSelectedFile(file);
        setIsImageUploaded(false);
        onFileChange?.(file);
    };

    return (
        <div className="rounded-lg p-3 flex items-center bg-[#F8F9FA] w-full">
            <div className="flex items-center w-full">
                <div className="w-[90px] h-[90px] rounded-full border-[1px] border-dashed border-gray-300 flex justify-center items-center mr-5 overflow-hidden flex-shrink-0">
                    {imagePreviewUrl ? (
                        <Image
                            src={imagePreviewUrl}
                            alt="Profile Preview"
                            width={90}
                            height={90}
                            className="rounded-full object-cover"
                        />
                    ) : (
                        <CiImageOn className="text-gray-300" size={30} />
                    )}
                </div>
                <div className="flex flex-col">
                    <h3 className="text-sm font-semibold text-gray-800 mb-1">Upload Profile Image</h3>
                    <p className="text-xs text-gray-600 mb-4">Image should be below 4 MB</p>
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <div className="flex gap-x-3">
                        <label
                            htmlFor="profile-image-input"
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-orange-500 hover:bg-orange-600 text-white py-1.5 px-3 rounded-md cursor-pointer text-xs font-medium inline-block text-center transition-colors duration-200"
                        >
                            Upload
                        </label>
                        {(selectedFile || isImageUploaded) && (
                            <button
                                onClick={resetImage}
                                className="bg-transparent text-orange-500 hover:text-orange-600 py-1.5 px-3 rounded-md cursor-pointer border border-orange-500 hover:border-orange-600 text-xs font-medium transition-colors duration-200"
                            >
                                {isImageUploaded ? 'Remove Image' : 'Cancel'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileImageUploader;

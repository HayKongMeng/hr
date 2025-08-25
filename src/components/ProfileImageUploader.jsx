'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { CiImageOn } from "react-icons/ci";

/**
 * A component for uploading and previewing a profile image.
 * @param {object} props - The component props.
 * @param {File | string | null} [props.initialFile=null] - The initial file to display (can be a File object or a URL string from the API).
 * @param {(file: File | null) => void} props.onFileChange - Callback function for when the file changes.
 */
const ProfileImageUploader = ({ initialFile = null, onFileChange }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
    const [isImageUploaded, setIsImageUploaded] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (typeof initialFile === 'string') {
            // If initialFile is a string, it's a relative path from your API.
            // We must construct the full, absolute URL for next/image.
            // Assumes your public files are served from a '/storage/' path. Adjust if needed.
            const absoluteUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/storage/${initialFile}`;
            setImagePreviewUrl(absoluteUrl);
            setSelectedFile(initialFile);
            setIsImageUploaded(true);
        }
        else if (initialFile instanceof File) {
            // If it's a File object
            setImagePreviewUrl(URL.createObjectURL(initialFile));
            setSelectedFile(initialFile);
            setIsImageUploaded(true);
        } else {
            // If initialFile is null or invalid, reset everything.
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
        const file = event.target.files?.[0];
        if (!file) {
            resetImage();
            return;
        }

        if (!file.type.startsWith('image/')) {
            alert('Please select a valid image file.');
            resetImage();
            return;
        }

        if (file.size > 4 * 1024 * 1024) { // 4MB
            alert('Image should be below 4 MB.');
            resetImage();
            return;
        }

        // Use URL.createObjectURL for an efficient preview of the new file
        const previewUrl = URL.createObjectURL(file);
        setImagePreviewUrl(previewUrl);

        setSelectedFile(file);
        setIsImageUploaded(false); // It's selected, but not yet "uploaded" via a form save
        onFileChange?.(file);
    };

    // A hidden file input to trigger the file browser
    const HiddenFileInput = () => (
        <input
            id="profile-image-input" // The label will click this
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
        />
    );

    return (
        <div className="rounded-lg p-3 flex items-center bg-[#F8F9FA] w-full">
            <HiddenFileInput />
            <div className="flex items-center w-full">
                <div className="w-[90px] h-[90px] rounded-full border-[1px] border-dashed border-gray-300 flex justify-center items-center mr-5 overflow-hidden flex-shrink-0 bg-gray-100">
                    {imagePreviewUrl ? (
                        <Image
                            src={imagePreviewUrl}
                            alt="Profile Preview"
                            width={90}
                            height={90}
                            className="rounded-full object-cover"
                            // Adding an unoptimized prop helps if you face issues with external domains
                            unoptimized={typeof selectedFile === 'string'}
                        />
                    ) : (
                        <CiImageOn className="text-gray-400" size={30} />
                    )}
                </div>
                <div className="flex flex-col">
                    <h3 className="text-sm font-semibold text-gray-800 mb-1">Upload Profile Image</h3>
                    <p className="text-xs text-gray-600 mb-4">Image should be below 4 MB (JPG, PNG)</p>

                    <div className="flex gap-x-3">
                        <label
                            htmlFor="profile-image-input"
                            className="bg-orange-500 hover:bg-orange-600 text-white py-1.5 px-3 rounded-md cursor-pointer text-xs font-medium inline-block text-center transition-colors duration-200"
                        >
                            Upload
                        </label>
                        {(selectedFile || isImageUploaded) && (
                            <button
                                type="button" // Important to prevent form submission
                                onClick={resetImage}
                                className="bg-transparent text-orange-500 hover:text-orange-600 py-1.5 px-3 rounded-md cursor-pointer border border-orange-500 hover:border-orange-600 text-xs font-medium transition-colors duration-200"
                            >
                                {isImageUploaded ? 'Remove' : 'Cancel'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileImageUploader;
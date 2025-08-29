'use client';
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { CiImageOn } from "react-icons/ci";

/**
 * A component for uploading and previewing a profile image.
 * @param {object} props - The component props.
 * @param {File | string | null} [props.initialFile=null] - The initial file to display (can be a File object or a full URL string from the API).
 * @param {(file: File | null) => void} props.onFileChange - Callback function for when the file changes.
 */
const ProfileImageUploader = ({ initialFile = null, onFileChange }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
    const [isImageUploaded, setIsImageUploaded] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        // This logic now assumes `initialFile` is a full, absolute URL from your API (e.g., the `image_url` property)
        if (typeof initialFile === 'string' && initialFile) {
            setImagePreviewUrl("/"+initialFile);
            setSelectedFile(initialFile);
            setIsImageUploaded(true);
        } else if (initialFile instanceof File) {
            setImagePreviewUrl(URL.createObjectURL(initialFile));
            setSelectedFile(initialFile);
            setIsImageUploaded(true);
        } else {
            resetImage();
        }
    }, [initialFile]);

    const resetImage = () => {
        // BEST PRACTICE: Clean up object URL to prevent memory leaks
        if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(imagePreviewUrl);
        }
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

        // Validation logic
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

        // BEST PRACTICE: Clean up previous blob URL before creating a new one
        if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(imagePreviewUrl);
        }

        const previewUrl = URL.createObjectURL(file);
        setImagePreviewUrl(previewUrl);
        setSelectedFile(file);
        setIsImageUploaded(false); // This is a new, unsaved file
        onFileChange?.(file);
    };

    return (
        <div className="rounded-lg p-3 flex items-center bg-gray-50 w-full border border-gray-200">
            <input
                id="profile-image-input"
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
            />

            <div className="flex items-center w-full">
                <div className="w-24 h-24 rounded-full border border-dashed border-gray-300 flex justify-center items-center mr-5 overflow-hidden flex-shrink-0 bg-gray-100">
                    {imagePreviewUrl ? (
                        <Image
                            src={imagePreviewUrl}
                            alt="Profile Preview"
                            width={96}
                            height={96}
                            className="rounded-full object-cover w-full h-full"
                        />
                    ) : (
                        <CiImageOn className="text-gray-400" size={40} />
                    )}
                </div>
                <div className="flex flex-col">
                    <h3 className="text-sm font-semibold text-gray-800 mb-1">Upload Profile Image</h3>
                    <p className="text-xs text-gray-600 mb-4">Image should be below 4 MB (JPG, PNG)</p>
                    <div className="flex gap-x-3">
                        {/* This label now correctly triggers the hidden input via htmlFor */}
                        <label
                            htmlFor="profile-image-input"
                            className="bg-orange-500 hover:bg-orange-600 text-white py-1.5 px-3 rounded-md cursor-pointer text-xs font-medium inline-block text-center transition-colors duration-200"
                        >
                            Upload
                        </label>


                        {(selectedFile || isImageUploaded) && (
                            <button
                                type="button"
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
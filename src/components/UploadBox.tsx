"use client";

import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon } from 'lucide-react';

interface UploadBoxProps {
    onFileSelect: (file: File) => void;
    selectedFile: File | null;
}

export const UploadBox: React.FC<UploadBoxProps> = ({ onFileSelect, selectedFile }) => {
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            onFileSelect(e.target.files[0]);
        }
    };

    const previewUrl = selectedFile ? URL.createObjectURL(selectedFile) : null;

    return (
        <div
            className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-colors cursor-pointer min-h-[200px] text-center
        ${dragActive ? 'border-orange-500 bg-orange-50' : 'border-slate-300 hover:border-blue-400 bg-slate-50'}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
        >
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleChange}
                className="hidden"
            />

            {previewUrl ? (
                <div className="w-full h-full flex flex-col items-center">
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden shadow-sm mb-4">
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    <p className="text-sm font-medium text-slate-700 truncate w-full max-w-[200px]">
                        {selectedFile?.name}
                    </p>
                    <p className="text-xs text-blue-600 mt-2 hover:underline">Click to change image</p>
                </div>
            ) : (
                <>
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4 text-blue-600">
                        <UploadCloud size={32} />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-1">Upload Product Image</h3>
                    <p className="text-sm text-slate-500 max-w-[240px]">
                        Drag and drop your image here, or click to browse files
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-400">
                        <ImageIcon size={14} /> JPG, PNG up to 10MB
                    </div>
                </>
            )}
        </div>
    );
};

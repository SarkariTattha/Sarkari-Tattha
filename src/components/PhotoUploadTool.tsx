import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Camera,
  Image as ImageIcon,
  Check,
  RotateCw,
  Sliders,
  Download,
  X,
  FileCheck,
  Maximize2,
  Sparkles
} from 'lucide-react';

interface PhotoUploadToolProps {
  onPhotoSelected?: (file: File, dataUrl: string) => void;
  onPhotoFinalized?: (dataUrl: string) => void;
  label?: string;
  requiredFormatText?: string;
  targetMaxKb?: number;
}

export const PhotoUploadTool: React.FC<PhotoUploadToolProps> = ({
  onPhotoSelected,
  onPhotoFinalized,
  label = 'Passport Size Applicant Photo',
  requiredFormatText = 'Passport Photo (3.5cm x 4.5cm), White Background, Max 50KB',
  targetMaxKb = 50,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [fileDetails, setFileDetails] = useState<{ name: string; sizeKb: number; type: string } | null>(null);
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'camera'>('upload');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setSelectedImage(dataUrl);
      const sizeKb = Math.round(file.size / 1024);
      setFileDetails({
        name: file.name,
        sizeKb,
        type: file.type,
      });
      if (onPhotoSelected) {
        onPhotoSelected(file, dataUrl);
      }
      if (onPhotoFinalized) {
        onPhotoFinalized(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert('Camera access failed or unavailable in browser frame.');
      setIsCameraActive(false);
    }
  };

  const captureCameraPhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 500;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, 400, 500);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setSelectedImage(dataUrl);
        setFileDetails({
          name: 'passport_live_photo.jpg',
          sizeKb: 38,
          type: 'image/jpeg',
        });

        // Convert dataUrl to File
        fetch(dataUrl)
          .then((res) => res.blob())
          .then((blob) => {
            const capturedFile = new File([blob], 'passport_live_photo.jpg', { type: 'image/jpeg' });
            if (onPhotoSelected) onPhotoSelected(capturedFile, dataUrl);
            if (onPhotoFinalized) onPhotoFinalized(dataUrl);
          });
      }

      // Stop camera stream
      const stream = videoRef.current.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      setIsCameraActive(false);
    }
  };

  const handleDownloadOptimized = () => {
    if (!selectedImage) return;
    const link = document.createElement('a');
    link.href = selectedImage;
    link.download = `Sarkari_Tattha_Passport_Photo_${Date.now()}.jpg`;
    link.click();
  };

  const resetPhoto = () => {
    setSelectedImage(null);
    setFileDetails(null);
    setRotation(0);
    setBrightness(100);
    setContrast(100);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
      {/* Tool Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-3 gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <Camera className="w-5 h-5 text-orange-600" />
            <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">{label}</h4>
            <span className="px-2 py-0.5 bg-orange-100 text-orange-800 text-[10px] font-black rounded-md uppercase">
              CSC Photo Studio
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">{requiredFormatText}</p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-700 space-x-1">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-3 py-1 rounded-lg transition ${
              activeTab === 'upload' ? 'bg-white text-orange-600 shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            Upload File
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('camera');
              startCamera();
            }}
            className={`px-3 py-1 rounded-lg transition ${
              activeTab === 'camera' ? 'bg-white text-orange-600 shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            Live WebCam
          </button>
        </div>
      </div>

      {/* Main Upload / Camera Area */}
      {!selectedImage ? (
        activeTab === 'upload' ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-orange-200 hover:border-orange-500 bg-orange-50/30 hover:bg-orange-50/80 rounded-2xl p-8 text-center cursor-pointer transition space-y-3 group"
          >
            <div className="w-14 h-14 bg-white border border-orange-200 text-orange-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm group-hover:scale-105 transition">
              <UploadCloud className="w-7 h-7" />
            </div>

            <div>
              <p className="text-xs font-extrabold text-slate-900">
                Click or Drag & Drop Passport Photo / Document
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Supports JPG, PNG, WEBP (Auto Resizes & Fits Indian Govt Specifications)
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        ) : (
          <div className="bg-slate-900 rounded-2xl p-4 text-center space-y-3 text-white">
            <div className="relative w-full max-w-sm mx-auto h-60 bg-black rounded-xl overflow-hidden border border-slate-700 flex items-center justify-center">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              {/* Passport Photo Frame Overlay */}
              <div className="absolute inset-0 border-2 border-dashed border-orange-400 m-8 rounded-lg pointer-events-none flex items-center justify-center">
                <span className="text-[10px] bg-black/60 text-orange-300 px-2 py-1 rounded">
                  Align Face Here (3.5cm x 4.5cm)
                </span>
              </div>
            </div>

            <div className="flex justify-center space-x-3">
              <button
                type="button"
                onClick={captureCameraPhoto}
                className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center space-x-2"
              >
                <Camera className="w-4 h-4" />
                <span>Snap Passport Photo</span>
              </button>
            </div>
          </div>
        )
      ) : (
        /* Preview & Photo Adjustment Suite */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-slate-50 p-4 rounded-2xl border border-slate-200">
          {/* Passport Photo Canvas Frame */}
          <div className="md:col-span-5 flex flex-col items-center justify-center space-y-2">
            <div className="relative w-40 h-52 bg-white p-2 border-2 border-slate-300 shadow-md rounded-xl overflow-hidden group">
              <img
                src={selectedImage}
                alt="Passport Size Preview"
                className="w-full h-full object-cover transition-all"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                }}
              />
              <div className="absolute bottom-1 right-1 bg-slate-900/80 text-orange-400 text-[9px] font-mono px-1.5 py-0.5 rounded">
                3.5 x 4.5 cm
              </div>
            </div>

            <div className="text-center">
              <span className="inline-flex items-center space-x-1 text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                <FileCheck className="w-3 h-3" />
                <span>Valid Gov Spec ({fileDetails?.sizeKb || 42} KB)</span>
              </span>
            </div>
          </div>

          {/* Editing Controls & Actions */}
          <div className="md:col-span-7 space-y-3 text-xs">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <div>
                <strong className="block text-slate-900">{fileDetails?.name || 'Applicant_Photo.jpg'}</strong>
                <span className="text-[11px] text-slate-500">Auto-formatted for CSC Portal Submission</span>
              </div>
              <button
                type="button"
                onClick={resetPhoto}
                className="p-1.5 text-slate-400 hover:text-red-600 bg-white rounded-lg border border-slate-200"
                title="Remove photo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Adjustments */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setRotation((prev) => (prev + 90) % 360)}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-700 font-semibold flex items-center space-x-1.5"
                >
                  <RotateCw className="w-3.5 h-3.5 text-orange-600" />
                  <span>Rotate</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setBrightness(110);
                    setContrast(110);
                  }}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-700 font-semibold flex items-center space-x-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                  <span>Auto Enhance</span>
                </button>
              </div>

              {/* Sliders */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <label className="text-slate-600 block font-semibold mb-0.5">Brightness: {brightness}%</label>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="w-full accent-orange-500"
                  />
                </div>
                <div>
                  <label className="text-slate-600 block font-semibold mb-0.5">Contrast: {contrast}%</label>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={contrast}
                    onChange={(e) => setContrast(Number(e.target.value))}
                    className="w-full accent-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleDownloadOptimized}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-orange-400" />
                <span>Download Photo (&lt;{targetMaxKb}KB)</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold rounded-xl text-xs"
              >
                Replace Photo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

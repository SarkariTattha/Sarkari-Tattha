import React, { useState, useRef } from 'react';
import { Upload, Camera, Image, X, Check, Loader2, Sparkles, Building2 } from 'lucide-react';
import { CenterPhoto } from '../types';
import { compressImageDataUrl } from '../lib/imageCompressor';

interface CenterPhotoUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoUploaded: (photo: CenterPhoto) => void;
}

export const CenterPhotoUploaderModal: React.FC<CenterPhotoUploaderModalProps> = ({
  isOpen,
  onClose,
  onPhotoUploaded
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'camera' | 'url'>('upload');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Reception Desk');
  const [description, setDescription] = useState('');
  
  // Photo source state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  
  // Camera state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Camera Access
  const startCamera = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'environment' }
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
    } catch (err) {
      console.error('Camera access error:', err);
      setError('Unable to access camera. Please allow camera permissions or upload an image file.');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  const captureCameraPhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        setPreviewUrl(dataUrl);
        stopCamera();
      }
    }
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) return;
    setPreviewUrl(urlInput.trim());
  };

  const handleModalClose = () => {
    stopCamera();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewUrl) {
      setError('Please select or capture a photo first.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('title', title || 'Center Facility Photo');
      formData.append('category', category);
      formData.append('description', description);

      if (selectedFile && activeTab === 'upload') {
        formData.append('photo', selectedFile);
      } else {
        const compressedUrl = await compressImageDataUrl(previewUrl, 1200, 1200, 0.75);
        formData.append('image_data', compressedUrl);
      }

      const res = await fetch('/api/center-photos', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (res.ok && data.success) {
        onPhotoUploaded(data.photo);
        handleModalClose();
      } else {
        setError(data.error || 'Failed to upload photo.');
      }
    } catch (err: any) {
      console.error('Submit photo error:', err);
      setError('Network error uploading photo. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-200 relative animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex justify-between items-center relative">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-600 rounded-2xl flex items-center justify-center text-white shadow-md">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight text-white">Upload Center Photo</h3>
              <p className="text-xs text-slate-300">Add physical center infrastructure photos to the website gallery</p>
            </div>
          </div>

          <button
            onClick={handleModalClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-semibold flex items-center space-x-2">
              <X className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Photo Source Tabs */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl space-x-1 text-xs font-extrabold uppercase tracking-wider">
            <button
              type="button"
              onClick={() => {
                setActiveTab('upload');
                stopCamera();
              }}
              className={`flex-1 py-2 rounded-xl flex items-center justify-center space-x-1.5 transition ${
                activeTab === 'upload' ? 'bg-white text-orange-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Upload File</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('camera');
                startCamera();
              }}
              className={`flex-1 py-2 rounded-xl flex items-center justify-center space-x-1.5 transition ${
                activeTab === 'camera' ? 'bg-white text-orange-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Take Photo</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('url');
                stopCamera();
              }}
              className={`flex-1 py-2 rounded-xl flex items-center justify-center space-x-1.5 transition ${
                activeTab === 'url' ? 'bg-white text-orange-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Image className="w-4 h-4" />
              <span>Paste URL</span>
            </button>
          </div>

          {/* Tab 1: File Upload Box */}
          {activeTab === 'upload' && (
            <div className="border-2 border-dashed border-slate-300 hover:border-orange-500 bg-slate-50 rounded-2xl p-6 text-center transition space-y-2">
              <Upload className="w-8 h-8 text-orange-600 mx-auto" />
              <div className="text-xs text-slate-700">
                <label className="cursor-pointer font-extrabold text-orange-600 hover:underline">
                  Click to choose image file
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-slate-400 mt-1">Supports PNG, JPG, WEBP (Max 15MB)</p>
              </div>
            </div>
          )}

          {/* Tab 2: Camera Capture */}
          {activeTab === 'camera' && (
            <div className="bg-slate-900 rounded-2xl p-4 text-center space-y-3 relative overflow-hidden">
              {isCameraActive ? (
                <div className="relative rounded-xl overflow-hidden aspect-video bg-black flex items-center justify-center">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  <canvas ref={canvasRef} className="hidden" />
                  <button
                    type="button"
                    onClick={captureCameraPhoto}
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-extrabold rounded-full text-xs uppercase tracking-wider shadow-lg flex items-center space-x-2"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Snap Center Photo</span>
                  </button>
                </div>
              ) : (
                <div className="py-8 space-y-3">
                  <Camera className="w-10 h-10 text-slate-500 mx-auto" />
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-xl"
                  >
                    Start Web / Mobile Camera
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: URL Input */}
          {activeTab === 'url' && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Image Web Link (URL)</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://example.com/center-photo.jpg"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-orange-500 text-slate-900 font-medium"
                />
                <button
                  type="button"
                  onClick={handleUrlSubmit}
                  className="px-4 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800"
                >
                  Load
                </button>
              </div>
            </div>
          )}

          {/* Photo Preview Box */}
          {previewUrl && (
            <div className="relative rounded-2xl overflow-hidden border-2 border-orange-500 bg-slate-900 aspect-video group">
              <img
                src={previewUrl}
                alt="Center Preview"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <span className="px-3 py-1 bg-emerald-500 text-white text-xs font-extrabold rounded-full flex items-center space-x-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Photo Ready</span>
                </span>
              </div>
            </div>
          )}

          {/* Photo Meta Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Photo Title / Label *</label>
              <input
                type="text"
                required
                placeholder="e.g. Front Reception & Waiting Desk"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Facility Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-orange-500"
              >
                <option value="Reception Area">Reception Area</option>
                <option value="CSP Banking Station">CSP Banking Station (AEPS)</option>
                <option value="Computer Lab">Computer Lab & Exam Station</option>
                <option value="Document Printing">Document Printing & Photo Studio</option>
                <option value="Customer Lounge">Customer Waiting Lounge</option>
                <option value="Exterior Banner">Exterior Signboard & Entrance</option>
                <option value="Other Facility">Other Facility</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Short Description (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Equipped with biometrics, instant PVC card printer, and high speed internet"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleModalClose}
              className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !previewUrl}
              className="px-7 py-3 bg-orange-600 hover:bg-orange-500 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-orange-600/30 transition disabled:opacity-50 flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading Photo...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Publish to Center Gallery</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Camera,
  PlusCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Maximize2,
  Sparkles,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { CenterPhoto } from '../types';
import { CenterPhotoUploaderModal } from './CenterPhotoUploaderModal';
import { useAuth } from '../context/AuthContext';

interface CenterGallerySectionProps {
  title?: string;
  subtitle?: string;
  showUploadBtn?: boolean;
}

export const CenterGallerySection: React.FC<CenterGallerySectionProps> = ({
  title = "Our Digital Center Infrastructure & Facilities",
  subtitle = "Take a virtual tour of our state-of-the-art CSC e-Governance center, AEPS biometric banking terminals, and customer support desks.",
  showUploadBtn = true
}) => {
  const { token, user } = useAuth();
  const [photos, setPhotos] = useState<CenterPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Modal & Lightbox state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const fetchPhotos = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/center-photos');
      if (res.ok) {
        const data = await res.json();
        setPhotos(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to load center photos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  const handlePhotoUploaded = (newPhoto: CenterPhoto) => {
    setPhotos((prev) => [newPhoto, ...prev]);
  };

  const handleDeletePhoto = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to remove this photo from the gallery?')) return;

    try {
      const res = await fetch(`/api/center-photos/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (res.ok) {
        setPhotos((prev) => prev.filter((p) => p.id !== id));
        if (lightboxIndex !== null) setLightboxIndex(null);
      }
    } catch (err) {
      console.error('Failed to delete photo:', err);
    }
  };

  // Categories list
  const categories = ['All', 'Reception Area', 'CSP Banking Station', 'Computer Lab', 'Document Printing', 'Customer Lounge', 'Exterior Banner'];

  const filteredPhotos = selectedCategory === 'All'
    ? photos
    : photos.filter((p) => p.category === selectedCategory);

  const activeLightboxPhoto = lightboxIndex !== null ? filteredPhotos[lightboxIndex] : null;

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b theme-card-border pb-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full theme-badge text-[11px] font-black uppercase tracking-widest shadow-2xs">
            <Building2 className="w-4 h-4 theme-text-primary" />
            <span>Center Infrastructure Gallery</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight theme-card-text">
            {title}
          </h2>

          <p className="text-xs sm:text-sm theme-card-muted font-medium leading-relaxed">
            {subtitle}
          </p>
        </div>

        {showUploadBtn && (
          <div className="shrink-0">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-5 py-3.5 theme-bg-primary theme-bg-primary-hover text-white font-extrabold uppercase tracking-wider rounded-2xl shadow-lg shadow-orange-600/20 transition transform hover:-translate-y-0.5 text-xs flex items-center space-x-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Upload Center Photo</span>
            </button>
          </div>
        )}
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition whitespace-nowrap cursor-pointer ${
              selectedCategory === cat
                ? 'theme-bg-primary text-white shadow-sm'
                : 'theme-card-bg hover:theme-bg-light theme-card-text border theme-card-border'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Photo Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-slate-200 dark:bg-slate-800 rounded-3xl h-64"></div>
          ))}
        </div>
      ) : filteredPhotos.length === 0 ? (
        <div className="p-12 text-center theme-card-bg rounded-3xl border theme-card-border space-y-4">
          <Camera className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold theme-card-text">No Photos in Category</h3>
          <p className="text-xs theme-card-muted max-w-md mx-auto">
            Be the first to upload photos of your center facilities, customer counters, or computer terminals.
          </p>
          {showUploadBtn && (
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-5 py-2.5 theme-bg-primary text-white font-bold rounded-xl text-xs inline-flex items-center space-x-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add First Center Photo</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPhotos.map((photo, index) => (
            <div
              key={photo.id}
              onClick={() => setLightboxIndex(index)}
              className="group relative theme-card-bg rounded-3xl overflow-hidden border theme-card-border shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col transform hover:-translate-y-1"
            >
              {/* Image Container */}
              <div className="relative aspect-4/3 bg-slate-900 overflow-hidden">
                <img
                  src={photo.image_url}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  referrerPolicy="no-referrer"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-60 group-hover:opacity-40 transition" />

                {/* Category Badge */}
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider rounded-full border border-white/20 flex items-center space-x-1">
                    <Tag className="w-3 h-3 text-orange-400" />
                    <span>{photo.category}</span>
                  </span>
                </div>

                {/* Maximize Icon */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition transform scale-90 group-hover:scale-100">
                  <div className="w-8 h-8 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-md">
                    <Maximize2 className="w-4 h-4" />
                  </div>
                </div>

                {/* Delete button for admin/staff */}
                {(user?.role === 'admin' || user?.role === 'staff' || !user) && (
                  <button
                    onClick={(e) => handleDeletePhoto(photo.id, e)}
                    className="absolute bottom-3 right-3 p-2 bg-red-600/90 hover:bg-red-600 text-white rounded-xl text-xs font-bold shadow-md transition opacity-0 group-hover:opacity-100"
                    title="Delete photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Photo Meta Footer */}
              <div className="p-5 space-y-1 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-extrabold tracking-tight theme-card-text group-hover:theme-text-primary transition line-clamp-1">
                    {photo.title}
                  </h4>
                  {photo.description && (
                    <p className="text-xs theme-card-muted line-clamp-2 mt-1 leading-relaxed font-medium">
                      {photo.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t theme-card-border flex justify-between items-center text-[11px] theme-card-muted font-bold uppercase tracking-wider">
                  <span className="flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5 theme-text-primary" />
                    <span>Verified Center Photo</span>
                  </span>
                  <span className="text-orange-500 group-hover:translate-x-0.5 transition">View Full →</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {activeLightboxPhoto && (
        <div
          onClick={() => setLightboxIndex(null)}
          className="fixed inset-0 bg-slate-950/90 backdrop-blur-lg z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl w-full bg-slate-900 text-white rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col max-h-[90vh]"
          >
            {/* Top Bar */}
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-orange-600 text-white text-xs font-black uppercase tracking-wider rounded-full">
                  {activeLightboxPhoto.category}
                </span>
                <h3 className="text-sm font-bold text-slate-100 truncate max-w-md">
                  {activeLightboxPhoto.title}
                </h3>
              </div>

              <button
                onClick={() => setLightboxIndex(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Photo Viewport */}
            <div className="relative flex-1 bg-black flex items-center justify-center p-2 min-h-[350px] max-h-[65vh] overflow-hidden">
              <img
                src={activeLightboxPhoto.image_url}
                alt={activeLightboxPhoto.title}
                className="max-h-full max-w-full object-contain rounded-xl"
                referrerPolicy="no-referrer"
              />

              {/* Prev Button */}
              {lightboxIndex! > 0 && (
                <button
                  onClick={() => setLightboxIndex(lightboxIndex! - 1)}
                  className="absolute left-4 p-3 rounded-full bg-slate-900/80 hover:bg-orange-600 text-white transition shadow-lg"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}

              {/* Next Button */}
              {lightboxIndex! < filteredPhotos.length - 1 && (
                <button
                  onClick={() => setLightboxIndex(lightboxIndex! + 1)}
                  className="absolute right-4 p-3 rounded-full bg-slate-900/80 hover:bg-orange-600 text-white transition shadow-lg"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Bottom Caption */}
            <div className="p-5 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h4 className="text-base font-extrabold text-white">{activeLightboxPhoto.title}</h4>
                {activeLightboxPhoto.description && (
                  <p className="text-xs text-slate-400 mt-0.5">{activeLightboxPhoto.description}</p>
                )}
              </div>

              <div className="flex items-center space-x-3 text-xs text-slate-400">
                <span>Photo {lightboxIndex! + 1} of {filteredPhotos.length}</span>
                {(user?.role === 'admin' || user?.role === 'staff' || !user) && (
                  <button
                    onClick={(e) => handleDeletePhoto(activeLightboxPhoto.id, e)}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition flex items-center space-x-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Photo</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      <CenterPhotoUploaderModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onPhotoUploaded={handlePhotoUploaded}
      />
    </section>
  );
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import { saveAllSettingsToFirestore, getSettingsFromFirestore } from '../lib/firebaseStore';

export interface SiteSettings {
  center_name?: string;
  tagline?: string;
  logo_url?: string;
  hero_photo_url?: string;
  about_photo_url?: string;
  vle_name?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  opening_hours?: string;
  upi_id?: string;
  notice_banner?: string;
  disclaimer_text?: string;
  [key: string]: string | undefined;
}

interface SettingsContextType {
  settings: SiteSettings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
  updateSettings: (newSettings: Partial<SiteSettings>, token?: string) => Promise<boolean>;
}

const defaultSettings: SiteSettings = {
  center_name: 'Sarkari Tattha Digital Service Center',
  tagline: 'Aapka Digital Saathi',
  logo_url: '',
  hero_photo_url: '',
  about_photo_url: '',
  vle_name: 'Admin Center Manager',
  phone: '+91 98765 43210',
  whatsapp: '+91 98765 43210',
  email: 'support@csc-csp-center.com',
  address: 'Shop No. 12, Main Market Road, Near Bus Stand, District Center',
  opening_hours: 'Monday to Saturday: 8:00 AM - 8:00 PM (Sunday Closed)',
  upi_id: 'csc.servicepoint@upi',
  notice_banner: 'Authorized CSC & Banking Service Point • Mon - Sat: 8:00 AM - 8:00 PM',
  disclaimer_text: 'All services are provided subject to applicable government rules, banking regulations, portal availability and service-provider terms.'
};

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  loading: true,
  refreshSettings: async () => {},
  updateSettings: async () => false
});

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      let data: Record<string, string> = {};
      if (res.ok) {
        data = await res.json();
      }

      // Sync with Firebase Firestore as backup/cloud store
      try {
        const firestoreSettings = await getSettingsFromFirestore();
        data = { ...firestoreSettings, ...data };
      } catch (e) {
        console.warn('Firebase settings sync warning:', e);
      }

      const merged = {
        ...defaultSettings,
        ...data
      };

      setSettings(merged);

      // Async push merged settings to Firebase Firestore
      saveAllSettingsToFirestore(merged as Record<string, string>).catch(console.error);
    } catch (err) {
      console.error('Failed to load site settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSettings = async (newSettings: Partial<SiteSettings>, token?: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(newSettings)
      });

      if (res.ok) {
        const updated = {
          ...settings,
          ...newSettings
        };
        setSettings(updated);

        // Also save immediately to Google Firebase Firestore
        saveAllSettingsToFirestore(updated as Record<string, string>).catch(console.error);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to update settings:', err);
      return false;
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        refreshSettings: fetchSettings,
        updateSettings
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);

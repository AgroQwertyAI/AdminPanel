"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Server, QrCode } from 'lucide-react';
import QRCode from 'react-qr-code';

export default function SettingsPanel() {
  const settingsT = useTranslations('settingsPanel');
  const [entrypointUrl, setEntrypointUrl] = useState('');
  const [whatsappQrCode, setWhatsappQrCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchLLMEntrypoint();
    fetchWhatsappQrCode();

    // Set up polling interval (every second)
    const intervalId = setInterval(() => {
      fetchWhatsappQrCode();
    }, 1000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  const fetchLLMEntrypoint = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/settings/llm_endpoint');
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || settingsT('fetchError'));
      }

      const data = await response.json();
      setEntrypointUrl(data.llm_endpoint);
    } catch (error) {
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWhatsappQrCode = async () => {
    try {
      const response = await fetch('/api/settings/whatsapp_qr');
      
      if (!response.ok) {
        // Don't show error if QR code just doesn't exist yet
        if (response.status !== 404) {
          const error = await response.json();
          throw new Error(error.message || settingsT('qrCodeFetchError'));
        }
        return;
      }

      const data = await response.json();
      if (data.success && data.data?.qr_code) {
        setWhatsappQrCode(data.data.qr_code);
      }
    } catch (error) {
      console.error("Error fetching WhatsApp QR code:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      const response = await fetch('/api/settings/llm_endpoint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: entrypointUrl }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || settingsT('updateError'));
      }

      setMessage({ text: settingsT('updateSuccess'), type: 'success' });
    } catch (error) {
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full text-base-content">
      <h2 className="card-title text-secondary mb-6">{settingsT('title')}</h2>
      
      <div className="card bg-base-100 shadow-lg mb-6">
        <div className="card-body">
          <div className="flex items-center gap-2 mb-4">
            <Server size={20} className="text-primary" />
            <h3 className="text-lg font-medium">{settingsT('apiConfigTitle')}</h3>
          </div>

          {message.text && (
            <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'} mb-4`}>
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text">{settingsT('apiUrlLabel')}</span>
              </label>
              <input 
                type="text" 
                value={entrypointUrl} 
                onChange={(e) => setEntrypointUrl(e.target.value)}
                placeholder={settingsT('apiUrlPlaceholder')} 
                className="input input-bordered w-full" 
                required
              />
            </div>
            
            <div className="flex gap-2">
              <button 
                type="submit" 
                className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? settingsT('saving') : settingsT('save')}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* WhatsApp QR Code Section */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <div className="flex items-center gap-2 mb-4">
            <QrCode size={20} className="text-primary" />
            <h3 className="text-lg font-medium">{settingsT('whatsappQrTitle') || 'WhatsApp QR Code'}</h3>
          </div>

          {whatsappQrCode ? (
            <div className="flex flex-col items-center">
              <p className="mb-2">{settingsT('lastQrCodeLabel') || 'Last available QR code:'}</p>
              <div className="bg-white p-4 rounded-md shadow-sm">
                <QRCode 
                  value={whatsappQrCode} 
                  size={256}
                  style={{ maxWidth: "100%", height: "auto" }}
                />
              </div>
              <p className="text-sm mt-2 text-gray-500">
                {settingsT('qrCodeInfo') || 'Scan this code with WhatsApp to connect to the system'}
              </p>
            </div>
          ) : (
            <p>{settingsT('noQrCode') || 'No WhatsApp QR code available. It will appear here when generated.'}</p>
          )}
        </div>
      </div>
    </div>
  );
}
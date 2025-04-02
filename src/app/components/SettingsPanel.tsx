"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Server } from 'lucide-react';

export default function SettingsPanel() {
  const settingsT = useTranslations('settingsPanel');
  const [entrypointUrl, setEntrypointUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchLLMEntrypoint();
  }, []);

  const fetchLLMEntrypoint = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:8000/get_llm_entrypoint');
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || settingsT('fetchError'));
      }

      const data = await response.json();
      setEntrypointUrl(data.llm_entrypoint);
    } catch (error) {
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:8000/set_llm_entrypoint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: entrypointUrl }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || settingsT('updateError'));
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
      
      <div className="card bg-base-100 shadow-lg">
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
    </div>
  );
}
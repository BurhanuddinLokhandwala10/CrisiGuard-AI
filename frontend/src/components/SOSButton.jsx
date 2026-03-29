import { useState } from 'react';
import { ShieldAlert, Loader2 } from 'lucide-react';
import api from '../utils/api';

export default function SOSButton({ onSosSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSOS = async () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await api.post('/sos', {
            location: {
              lat: latitude,
              lng: longitude,
            }
          });
          if (onSosSuccess) onSosSuccess(res.data);
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to send SOS');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setError('Unable to retrieve your location');
        setLoading(false);
      }
    );
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleSOS}
        disabled={loading}
        className="group relative flex items-center justify-center w-36 h-36 bg-gradient-to-br from-red-500 to-red-600 rounded-full shadow-[0_0_40px_rgba(239,68,68,0.5)] hover:shadow-[0_0_60px_rgba(239,68,68,0.8)] transition-all duration-300 transform hover:scale-105 overflow-hidden"
      >
        <div className="absolute inset-0 rounded-full bg-red-400 group-hover:animate-ping opacity-20"></div>
        {loading ? (
          <Loader2 className="w-16 h-16 text-white animate-spin" />
        ) : (
          <div className="flex flex-col items-center">
             <ShieldAlert className="w-12 h-12 text-white mb-1" />
             <span className="font-black text-white text-xl tracking-widest">SOS</span>
          </div>
        )}
      </button>
      {error && <p className="text-red-500 font-semibold mt-4 text-sm bg-red-50 px-3 py-1 rounded-full">{error}</p>}
    </div>
  );
}

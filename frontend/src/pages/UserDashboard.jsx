import { useState, useEffect } from 'react';
import api from '../utils/api';
import SOSButton from '../components/SOSButton';
import VoiceInput from '../components/VoiceInput';
import Map from '../components/Map';
import { MapPin, Image as ImageIcon, CheckCircle2, AlertTriangle, AlertCircle, Loader2 } from 'lucide-react';

export default function UserDashboard() {
  const [incidents, setIncidents] = useState([]);
  const [userLoc, setUserLoc] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', image: '' });
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchIncidents();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationEnabled(true);
      });
    }
  }, []);

  const fetchIncidents = async () => {
    try {
      const res = await api.get('/incidents');
      setIncidents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleVoiceText = (text) => {
    setFormData(prev => ({ ...prev, description: prev.description + ' ' + text }));
  };

  const submitIncident = async (e) => {
    e.preventDefault();
    if (!userLoc) return alert('Location is required. Please allow location access.');
    
    setLoading(true);
    try {
      await api.post('/incidents', {
        ...formData,
        location: userLoc
      });
      setSuccessMsg('Incident reported successfully. AI is verifying urgency.');
      setFormData({ title: '', description: '', image: '' });
      fetchIncidents();
      
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error creating incident');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
         <div>
            <h1 className="text-3xl font-extrabold text-slate-900">User Dashboard</h1>
            <p className="text-slate-500 mt-1">Report emergencies and view nearby incidents.</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Reporting */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel rounded-2xl p-8 flex flex-col items-center justify-center">
            <SOSButton onSosSuccess={(data) => {
              setSuccessMsg('SOS Sent Successfully!');
              fetchIncidents();
              setTimeout(() => setSuccessMsg(''), 5000);
            }} />
            <p className="text-sm text-center text-slate-500 mt-4 max-w-[200px]">
              Use only in extreme life-threatening emergencies.
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><AlertCircle className="text-brand-500" /> Report Incident</h2>
            
            {successMsg && (
              <div className="mb-4 bg-green-50 text-green-700 p-3 rounded-lg text-sm flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-5 h-5" /> {successMsg}
              </div>
            )}

            <form onSubmit={submitIncident} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Title</label>
                <input 
                  required
                  type="text" 
                  className="w-full border px-4 py-2 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  placeholder="e.g. Car crash on Main st."
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div>
                <div className="flex justify-between items-end mb-1">
                  <label className="block text-sm font-semibold text-slate-700">Description</label>
                  <VoiceInput onTextExtracted={handleVoiceText} />
                </div>
                <textarea 
                  required
                  rows="4" 
                  className="w-full border px-4 py-3 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition-all resize-none"
                  placeholder="Describe what is happening clearly..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <ImageIcon className="w-4 h-4" /> Image URL (Optional)
                </label>
                <input 
                  type="url" 
                  className="w-full border px-4 py-2 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  placeholder="https://..."
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                />
              </div>

              <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${locationEnabled ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'}`}>
                <MapPin className="w-5 h-5" />
                {locationEnabled ? 'GPS Location Acquired' : 'Waiting for GPS Location...'}
              </div>

              <button 
                type="submit" 
                disabled={loading || !locationEnabled}
                className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-slate-800 transition-colors shadow-lg disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Report'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Live Map */}
        <div className="lg:col-span-2 relative min-h-[500px] lg:min-h-0 bg-slate-100 rounded-3xl p-1 shadow-inner overflow-hidden border">
           <div className="absolute top-4 left-4 z-20 glass-panel px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg">
             <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
             Live Incident Map
           </div>
           {userLoc ? (
             <Map incidents={incidents} center={[userLoc.lat, userLoc.lng]} />
           ) : (
             <div className="flex flex-col items-center justify-center h-full text-slate-500">
               <Loader2 className="w-10 h-10 animate-spin mb-4 text-slate-400" />
               <p>Acquiring coordinates to display map...</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}

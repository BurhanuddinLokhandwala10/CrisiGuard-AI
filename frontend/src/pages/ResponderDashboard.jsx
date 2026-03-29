import { useState, useEffect } from 'react';
import api from '../utils/api';
import Map from '../components/Map';
import { LocateFixed, CheckSquare, Activity } from 'lucide-react';

export default function ResponderDashboard() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignedIncidents();
    const interval = setInterval(fetchAssignedIncidents, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchAssignedIncidents = async () => {
    try {
      const res = await api.get('/responder/incidents');
      setIncidents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/responder/incidents/${id}/status`, { status });
      fetchAssignedIncidents();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const mapCenter = incidents.length > 0 ? [incidents[0].location.lat, incidents[0].location.lng] : [51.505, -0.09];

  if (loading) return <div className="p-8 text-center text-slate-500">Loading assignments...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-64px)] flex flex-col">
      <div className="mb-6 flex justify-between items-end shrink-0">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <Activity className="text-red-600" /> Dispatch Control
          </h1>
          <p className="text-slate-500 mt-1">Manage your active emergency assignments.</p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        
        {/* Left: Assigments List */}
        <div className="lg:col-span-1 overflow-y-auto space-y-4 pr-2">
          {incidents.length === 0 ? (
            <div className="glass-panel p-8 text-center rounded-2xl text-slate-500">
              No active assignments. Standby.
            </div>
          ) : (
            incidents.map(incident => (
              <div key={incident._id} className="glass-panel rounded-xl p-5 border-t-4 shadow-md" style={{ borderTopColor: incident.severity === 'CRITICAL' ? '#ef4444' : '#f97316' }}>
                <div className="mb-3">
                  <h3 className="font-bold text-lg text-slate-900 leading-tight">{incident.title}</h3>
                  <div className="flex gap-2 mt-2">
                    <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded font-bold">{incident.type}</span>
                    <span className="bg-red-50 text-red-600 text-xs px-2 py-1 rounded font-bold">{incident.severity}</span>
                  </div>
                </div>
                
                <p className="text-sm text-slate-600 mb-4">{incident.description}</p>
                
                <div className="bg-slate-50 rounded p-3 mb-4 text-xs font-mono text-slate-600 break-all">
                  <div className="flex items-center gap-1 mb-1 font-sans font-bold text-slate-800"><LocateFixed className="w-3 h-3"/> GPS Coordinates</div>
                  {incident.location.lat}, {incident.location.lng}
                </div>

                <div className="flex flex-col gap-2">
                  <div className="text-xs font-semibold text-slate-500">Update Status:</div>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => updateStatus(incident._id, 'En Route')}
                      disabled={incident.status === 'En Route' || incident.status === 'Resolved'}
                      className={`py-2 rounded text-sm font-bold transition-colors ${incident.status === 'En Route' ? 'bg-brand-500 text-white shadow-inner' : 'bg-brand-50 text-brand-700 hover:bg-brand-100'}`}
                    >
                      En Route
                    </button>
                    <button 
                      onClick={() => updateStatus(incident._id, 'Resolved')}
                      disabled={incident.status === 'Resolved'}
                      className={`py-2 rounded text-sm font-bold transition-colors flex items-center justify-center gap-1 ${incident.status === 'Resolved' ? 'bg-green-500 text-white shadow-inner' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
                    >
                      <CheckSquare className="w-4 h-4"/> Resolved
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right: Focused Map */}
        <div className="lg:col-span-2 relative bg-slate-200 rounded-3xl overflow-hidden shadow-inner border border-slate-300">
           {incidents.length > 0 ? (
             <Map incidents={incidents} center={mapCenter} />
           ) : (
             <div className="flex items-center justify-center h-full text-slate-500 font-medium">
               Assigned incident map will appear here.
             </div>
           )}
        </div>
      </div>
    </div>
  );
}

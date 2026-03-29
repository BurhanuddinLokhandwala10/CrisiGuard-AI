import { useState, useEffect } from 'react';
import api from '../utils/api';
import axios from 'axios';
import { Trash2, ShieldCheck, AlertTriangle, MapPin, Hospital, Flame, ShieldAlert, Navigation } from 'lucide-react';

export default function AdminDashboard() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [overpassLoading, setOverpassLoading] = useState(false);
  const [facilities, setFacilities] = useState({}); // mapped by incident _id to array of facilities
  const [expandedRow, setExpandedRow] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const incRes = await api.get('/admin/incidents');
      setIncidents(incRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const overrideStatus = async (id, statusType) => {
    try {
      await api.put(`/admin/incidents/${id}`, { statusType });
      fetchData();
    } catch (err) {
      alert('Error updating status');
    }
  };

  const deleteIncident = async (id) => {
    try {
      await api.delete(`/admin/incidents/${id}`);
      setConfirmDeleteId(null);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Error deleting incident from server');
    }
  };

  // Distance helper (Haversine formula outline mapped to rough km distance from lat/lng diff)
  // Overpass returns exact nodes. I can use turf.js, but a simple heuristic is fine for this UI.
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // km
    const dLat = (lat2-lat1) * Math.PI / 180;
    const dLon = (lon2-lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  };

  const fetchNearbyResponders = async (incident) => {
    setExpandedRow(incident._id);
    if (facilities[incident._id] && facilities[incident._id].length > 0) return; // cache

    setOverpassLoading(true);
    const lat = incident.location.lat;
    const lng = incident.location.lng;
    
    // Overpass QL for hospitals, fire_stations, police around 5000 meters
    const query = `
      [out:json];
      (
        node["amenity"="hospital"](around:5000,${lat},${lng});
        node["amenity"="fire_station"](around:5000,${lat},${lng});
        node["amenity"="police"](around:5000,${lat},${lng});
      );
      out body 10;
    `;
    
    try {
      const response = await axios.post('https://overpass-api.de/api/interpreter', query, {
        headers: { 'Content-Type': 'text/plain' }
      });
      
      const elements = response.data.elements || [];
      const parsedFacilities = elements.map(e => ({
        id: e.id,
        name: e.tags?.name || `Local ${e.tags?.amenity}`,
        type: e.tags?.amenity, // hospital, fire_station, police
        dist: calculateDistance(lat, lng, e.lat, e.lon)
      })).sort((a,b) => Number(a.dist) - Number(b.dist));

      setFacilities(prev => ({ ...prev, [incident._id]: parsedFacilities }));
    } catch (error) {
      console.error(error);
      alert('Overpass API failed to fetch nearby responders');
    } finally {
      setOverpassLoading(false);
    }
  };

  const assignRealResponder = async (incidentId, facility) => {
    try {
       await api.post(`/admin/incidents/${incidentId}/assign`, {
         responderDetails: {
           name: facility.name,
           type: facility.type,
           dist: facility.dist
         }
       });
       setExpandedRow(null); // Close assignment panel
       fetchData();
    } catch (err) {
       alert('Error assigning facility');
    }
  }

  const filteredIncidents = incidents.filter(i => {
    if (filter === 'ALL') return true;
    if (filter === 'UNVERIFIED') return i.statusType !== 'VERIFIED';
    if (filter === 'CRITICAL') return i.severity === 'CRITICAL';
    return true;
  });

  const getTypeIcon = (type) => {
    if(type === 'fire_station') return <Flame className="w-4 h-4 text-orange-500" />;
    if(type === 'police') return <ShieldAlert className="w-4 h-4 text-blue-500" />;
    return <Hospital className="w-4 h-4 text-red-500" />;
  }

  if (loading) return <div className="p-8 text-center text-slate-500">Loading admin panel...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="text-brand-600" /> Admin Oversight
          </h1>
          <p className="text-slate-500 mt-1">Review AI classifications and dispatch geographic responders.</p>
        </div>
        <div className="flex gap-2">
           <button onClick={() => setFilter('ALL')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${filter === 'ALL' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border hover:bg-slate-50'}`}>All</button>
           <button onClick={() => setFilter('UNVERIFIED')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${filter === 'UNVERIFIED' ? 'bg-yellow-500 text-white' : 'bg-white text-slate-600 border hover:bg-slate-50'}`}>Needs Review</button>
           <button onClick={() => setFilter('CRITICAL')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${filter === 'CRITICAL' ? 'bg-red-500 text-white' : 'bg-white text-slate-600 border hover:bg-slate-50'}`}>Critical</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredIncidents.length === 0 ? (
          <div className="glass-panel p-8 text-center rounded-2xl text-slate-500">No incidents found for this filter.</div>
        ) : (
          filteredIncidents.map(incident => (
            <div key={incident._id} className="glass-panel rounded-xl border-l-4 overflow-hidden shadow-sm" style={{ borderLeftColor: incident.severity === 'CRITICAL' ? '#ef4444' : incident.severity === 'HIGH' ? '#f97316' : '#3b82f6' }}>
              <div className="p-5 flex flex-col md:flex-row justify-between gap-6">
                
                {/* Information block */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-xl font-bold text-slate-900 leading-none">{incident.title}</h3>
                    
                    {/* Status Badge Update */}
                    {incident.status === 'Assigned' && (
                       <span className="px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-xs font-bold tracking-wide flex items-center gap-1 shadow-sm border border-brand-200">
                         <span className="w-1.5 h-1.5 bg-brand-600 rounded-full animate-ping mr-1"></span>
                         Solving Crisis
                       </span>
                    )}

                    {incident.aiVerified ? (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-bold tracking-wide border border-green-200">AI VERIFIED</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs font-bold tracking-wide flex items-center gap-1 border border-yellow-200">
                         <AlertTriangle className="w-3 h-3"/> {incident.statusType}
                      </span>
                    )}
                    <span className="text-xs text-slate-400 font-medium bg-slate-100 px-2 py-0.5 rounded border border-slate-200">AI Score: {incident.fakeDetectionScore}/100</span>
                  </div>
                  <p className="text-sm text-slate-600 mb-4 tracking-tight leading-relaxed max-w-3xl">{incident.description}</p>
                  <div className="flex items-center gap-5 text-xs font-medium text-slate-500">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400"/> {incident.location.lat.toFixed(4)}, {incident.location.lng.toFixed(4)}</span>
                    <span><b className="text-slate-700">Type:</b> {incident.type}</span>
                    <span><b className="text-slate-700">Reporter:</b> {incident.reportedBy?.name || 'Unknown'}</span>
                  </div>
                </div>
                
                {/* Actions block */}
                <div className="flex flex-col gap-2 min-w-[200px] border-l-0 md:border-l border-slate-100 md:pl-6">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Override Status</div>
                  <div className="flex gap-2">
                    <button onClick={() => overrideStatus(incident._id, 'VERIFIED')} className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 py-1.5 rounded text-xs font-bold transition-colors">Verify</button>
                    <button onClick={() => overrideStatus(incident._id, 'SUSPICIOUS')} className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 py-1.5 rounded text-xs font-bold transition-colors">Fake</button>
                    
                    {confirmDeleteId === incident._id ? (
                      <button onClick={() => deleteIncident(incident._id)} className="flex-shrink-0 bg-danger-600 text-white hover:bg-danger-700 px-2 rounded font-bold text-xs transition-colors shadow-sm" title="Confirm Delete">
                        Sure?
                      </button>
                    ) : (
                      <button onClick={() => setConfirmDeleteId(incident._id)} className="flex-shrink-0 text-red-400 hover:text-red-600 hover:bg-red-50 px-2 rounded border border-transparent transition-all" title="permanently delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="my-1 border-t border-slate-100"></div>

                  {incident.assignedResponder ? (
                     <div className="bg-slate-50 p-2 rounded border border-slate-200 text-xs">
                        <div className="font-bold text-slate-700 mb-1 flex items-center gap-1">
                          {getTypeIcon(incident.assignedResponder.type)} Assigned Unit
                        </div>
                        <div className="text-slate-600 truncate font-semibold" title={incident.assignedResponder.name}>{incident.assignedResponder.name}</div>
                        <div className="text-slate-400 mt-0.5">{incident.assignedResponder.dist}km away</div>
                     </div>
                  ) : (
                    <button 
                      onClick={() => fetchNearbyResponders(incident)}
                      className="w-full mt-1 bg-slate-900 hover:bg-slate-800 text-white py-2 rounded text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                    >
                      <Navigation className="w-3 h-3" /> Find Responders (Live)
                    </button>
                  )}
                </div>
              </div>

              {/* Overpass Live Facilities Panel */}
              {expandedRow === incident._id && !incident.assignedResponder && (
                 <div className="bg-slate-50 border-t border-slate-200 p-4 shadow-inner">
                    <div className="flex justify-between items-center mb-3">
                       <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                          Live OpenStreetMap Facilities (5km radius)
                       </h4>
                       <button onClick={() => setExpandedRow(null)} className="text-xs font-semibold text-slate-500 hover:text-slate-800">Close</button>
                    </div>

                    {overpassLoading ? (
                       <div className="flex items-center gap-2 text-sm text-brand-600 p-4 justify-center font-medium animate-pulse">
                          Fetching nearby hospitals, fire stations, and police stations...
                       </div>
                    ) : (
                       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                         {(facilities[incident._id] || []).length === 0 ? (
                           <div className="col-span-full text-center text-sm text-slate-500 py-4">No major facilities found nearby.</div>
                         ) : (
                           facilities[incident._id].map(fac => (
                             <div key={fac.id} className="bg-white border text-sm rounded-lg p-3 hover:border-brand-300 transition-colors shadow-sm flex items-center justify-between group">
                                <div className="min-w-0 pr-2">
                                  <span className="font-bold text-slate-700 truncate block text-xs mb-0.5">{fac.name}</span>
                                  <span className="text-[10px] text-slate-400 uppercase tracking-widest">{fac.type?.replace('_',' ')} • {fac.dist}km</span>
                                </div>
                                <button 
                                  onClick={() => assignRealResponder(incident._id, fac)}
                                  className="shrink-0 bg-brand-50 text-brand-700 hover:bg-brand-600 hover:text-white px-3 py-1.5 rounded font-bold text-xs transition-colors shadow-sm"
                                >
                                  Dispatch
                                </button>
                             </div>
                           ))
                         )}
                       </div>
                    )}
                 </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

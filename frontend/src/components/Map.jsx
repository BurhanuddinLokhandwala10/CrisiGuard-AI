import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';

// Fix leafet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const customMarker = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to dynamically set map center
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 14);
    }
  }, [center, map]);
  return null;
}

export default function Map({ incidents = [], center = [51.505, -0.09], selectable = false, onLocationSelect }) {
  
  const MapEvents = () => {
    useMapEvents({
      click(e) {
        if (selectable && onLocationSelect) {
          onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
        }
      },
    });
    return null;
  };

  return (
    <div className="h-full w-full rounded-xl overflow-hidden glass-panel z-10 relative">
      <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater center={center} />
        
        {incidents.map((incident) => (
          <Marker 
            key={incident._id} 
            position={[incident.location.lat, incident.location.lng]}
            icon={incident.severity === 'CRITICAL' || incident.severity === 'HIGH' ? customMarker : new L.Icon.Default()}
          >
            <Popup>
              <div className="font-sans">
                <h3 className="font-bold text-lg mb-1">{incident.title}</h3>
                <p className="text-sm mb-2 text-slate-600 line-clamp-2">{incident.description}</p>
                <div className="flex flex-wrap gap-2 text-xs font-semibold">
                  <span className={`px-2 py-1 rounded ${
                    incident.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {incident.severity}
                  </span>
                  <span className={`px-2 py-1 rounded ${
                    incident.aiVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {incident.aiVerified ? 'Verified' : incident.statusType.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

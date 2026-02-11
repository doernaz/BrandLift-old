import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from 'framer-motion';
import L from 'leaflet';

// Fix for default marker icon in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom simple pulse marker (using divIcon)
const createPulseIcon = (color: string, size: number = 12) => {
    return L.divIcon({
        className: 'custom-pulse-marker',
        html: `<div class="relative flex items-center justify-center" style="width: ${size}px; height: ${size}px;">
                 <div class="absolute w-full h-full rounded-full animate-ping opacity-75" style="background-color: ${color}"></div>
                 <div class="relative w-full h-full rounded-full shadow-[0_0_10px_${color}]" style="background-color: ${color}"></div>
               </div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
    });
};

const MOCK_CLIENTS = [
    // West Coast
    { id: 1, name: 'Sedona Resort', lat: 34.8697, lng: -111.7600, status: 'live' },
    { id: 2, name: 'Phoenix HVAC', lat: 33.4484, lng: -112.0740, status: 'warning' },
    { id: 3, name: 'Tucson Solar', lat: 32.2226, lng: -110.9747, status: 'live' },
    { id: 4, name: 'Flagstaff B&B', lat: 35.1983, lng: -111.6513, status: 'live' },
    { id: 5, name: 'LA Tech Hub', lat: 34.0522, lng: -118.2437, status: 'live' },
    { id: 6, name: 'SF Startup', lat: 37.7749, lng: -122.4194, status: 'live' },
    { id: 7, name: 'Seattle Coffee', lat: 47.6062, lng: -122.3321, status: 'audit' },
    { id: 8, name: 'Portland organic', lat: 45.5152, lng: -122.6784, status: 'live' },
    { id: 9, name: 'Vegas Casino', lat: 36.1699, lng: -115.1398, status: 'live' },

    // Mountain / Central
    { id: 10, name: 'Denver Brewery', lat: 39.7392, lng: -104.9903, status: 'live' },
    { id: 11, name: 'Austin BBQ', lat: 30.2672, lng: -97.7431, status: 'live' },
    { id: 12, name: 'Dallas Logistics', lat: 32.7767, lng: -96.7970, status: 'warning' },
    { id: 13, name: 'Chicago Pizza', lat: 41.8781, lng: -87.6298, status: 'live' },
    { id: 14, name: 'Nashville Music', lat: 36.1627, lng: -86.7816, status: 'live' },

    // East Coast
    { id: 15, name: 'NYC Finance', lat: 40.7128, lng: -74.0060, status: 'critical' },
    { id: 16, name: 'Boston Bio', lat: 42.3601, lng: -71.0589, status: 'live' },
    { id: 17, name: 'Miami Club', lat: 25.7617, lng: -80.1918, status: 'audit' },
    { id: 18, name: 'Atlanta Hub', lat: 33.7490, lng: -84.3880, status: 'live' },
    { id: 19, name: 'DC Legal', lat: 38.9072, lng: -77.0369, status: 'live' },
    { id: 20, name: 'Philly Cheese', lat: 39.9526, lng: -75.1652, status: 'live' },

    // Others
    { id: 21, name: 'Toronto Branch', lat: 43.6532, lng: -79.3832, status: 'live' },
    { id: 22, name: 'Vancouver Studio', lat: 49.2827, lng: -123.1207, status: 'live' },
];

const RadarScan = () => (
    <div className="absolute inset-0 z-[500] pointer-events-none overflow-hidden rounded">
        {/* Rotating Radar Sweep */}
        <div className="absolute inset-[-50%] w-[200%] h-[200%] animate-[spin_4s_linear_infinite] opacity-10"
            style={{
                background: 'conic-gradient(from 0deg, transparent 0deg, transparent 270deg, #00f2ff 360deg)'
            }}
        />
        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,242,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,242,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
    </div>
);

const getStatusColor = (status: string) => {
    switch (status) {
        case 'live': return '#00f2ff'; // Cyan
        case 'warning': return '#f59e0b'; // Amber
        case 'critical': return '#ef4444'; // Red
        case 'audit': return '#a855f7'; // Purple
        default: return '#94a3b8';
    }
};

// Helper component to fix map rendering issues (must be used inside MapContainer)
const MapController = () => {
    const map = useMap();

    useEffect(() => {
        // Force map to recalculate size after mount/animation
        const timer = setTimeout(() => {
            map.invalidateSize();
            // Re-center after invalidation to ensure correct position
            // Shift center west (-98) to move US right
            map.setView([38, -98], 3.8, { animate: false });
        }, 600); // Wait for transition (~500ms) to finish
        return () => clearTimeout(timer);
    }, [map]);

    return null;
};

export const ClientMap = () => {
    const [activeScanner, setActiveScanner] = useState({ lat: 39.8, lng: -98.6, text: 'SCANNING...' });

    // Simulate scanning effect moving around
    useEffect(() => {
        const interval = setInterval(() => {
            const randomClient = MOCK_CLIENTS[Math.floor(Math.random() * MOCK_CLIENTS.length)];
            setActiveScanner({
                lat: randomClient.lat,
                lng: randomClient.lng,
                text: `ANALYZING: ${randomClient.name.toUpperCase()}`
            });
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full h-[400px] rounded border border-slate-800 overflow-hidden relative z-0 group"
        >
            {/* HUD Overlays */}
            <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
                <div className="bg-[#0a0a0a]/90 backdrop-blur border border-slate-800 px-3 py-1 rounded text-xs font-mono text-cyan-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                    NODES_ACTIVE: {MOCK_CLIENTS.length}
                </div>
                <div className="bg-[#0a0a0a]/90 backdrop-blur border border-slate-800 px-3 py-1 rounded text-[10px] font-mono text-slate-400">
                    {activeScanner.text} <br />
                    <span className="text-cyan-600">LOC: {activeScanner.lat.toFixed(2)}, {activeScanner.lng.toFixed(2)}</span>
                </div>
            </div>

            <div className="absolute bottom-4 right-4 z-[1000] bg-[#0a0a0a]/90 backdrop-blur border border-slate-800 px-3 py-2 rounded text-[10px] font-mono text-slate-500">
                <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-cyan-400"></span> LIVE</div>
                <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> WARNING</div>
                <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> CRITICAL</div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-purple-500"></span> AUDIT</div>
            </div>

            <RadarScan />

            <MapContainer
                center={[38, -98]}
                zoom={3.8}
                zoomSnap={0.1}
                zoomDelta={0.1}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%', background: '#050505' }}
                zoomControl={false}
                dragging={true}
            >
                {/* Use the controller inside the provider */}
                <MapController />

                {/* Dark Mode Tiles */}
                <TileLayer
                    attribution='&copy; CARTO'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {MOCK_CLIENTS.map(client => (
                    <Marker
                        key={client.id}
                        position={[client.lat, client.lng]}
                        icon={createPulseIcon(getStatusColor(client.status), client.status === 'live' ? 8 : 12)}
                    >
                        <Popup className="custom-popup" closeButton={false}>
                            <div className="text-slate-900 font-sans text-xs min-w-[120px]">
                                <strong className="block text-cyan-600 uppercase tracking-wide mb-1 border-b border-gray-200 pb-1">{client.name}</strong>
                                <div className="flex justify-between text-[10px] text-slate-500">
                                    <span>STATUS:</span>
                                    <span style={{ color: getStatusColor(client.status) }} className="font-bold uppercase">{client.status}</span>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {/* Simulated Scanner Highlight */}
                <CircleMarker
                    center={[activeScanner.lat, activeScanner.lng]}
                    radius={20}
                    pathOptions={{ color: 'transparent', fillColor: '#00f2ff', fillOpacity: 0.1 }}
                />
            </MapContainer>

            {/* Vignette */}
            <div className="absolute inset-0 pointer-events-none rounded box-border border border-slate-800/20 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]"></div>
        </motion.div>
    );
};

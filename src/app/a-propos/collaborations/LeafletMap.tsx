"use client";

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './page.module.css';

// Fix for Leaflet default icon issues in Next.js
const customIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface MapProps {
    locations: Array<{
        name: string;
        type: string;
        position: { lat: number; lng: number };
    }>;
    center: { lat: number; lng: number };
}

export default function LeafletMap({ locations, center }: MapProps) {
    return (
        <MapContainer 
            center={[center.lat, center.lng]} 
            zoom={13} 
            scrollWheelZoom={false} 
            className={styles.leafletMap}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {locations.map((loc) => (
                <Marker 
                    key={loc.name} 
                    position={[loc.position.lat, loc.position.lng]}
                    icon={customIcon}
                >
                    <Popup className={styles.popup}>
                        <div className={styles.infoWindow}>
                            <strong>{loc.name}</strong>
                            <p>{loc.type}</p>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}

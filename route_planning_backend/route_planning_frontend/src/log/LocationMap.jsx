import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function LocationMap({ onLocationSelect, defaultLocation }) {
    const [position, setPosition] = useState(defaultLocation || [31.5204, 74.3587]);
    const [markerPosition, setMarkerPosition] = useState(defaultLocation || [31.5204, 74.3587]);

    const MapClickHandler = () => {
        useMapEvents({
            click: (e) => {
                const { lat, lng } = e.latlng;
                setPosition([lat, lng]);
                setMarkerPosition([lat, lng]);
                onLocationSelect({ lat, lng });
            },
        });
        return null;
    };

    useEffect(() => {
        if (defaultLocation) {
            setPosition(defaultLocation);
            setMarkerPosition(defaultLocation);
        }
    }, [defaultLocation]);

    return (
        <MapContainer
            center={position}
            zoom={13}
            style={{ height: '400px', width: '400px' }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={markerPosition}>
                <Popup>Selected Location</Popup>
            </Marker>
            <MapClickHandler />
        </MapContainer>
    );
}

export default LocationMap;
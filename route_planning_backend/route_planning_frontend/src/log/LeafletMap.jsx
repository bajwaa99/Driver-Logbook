import React, { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet';
import { ORS } from '@routingjs/ors';
// Fix for Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});
const MAPS_API_KEY = '5b3ce3597851110001cf624871a06a64120441fe9a69bd3f9ba3fd57'

function LeafletORSRoutingMap({ waypoints }) {
    const map = useMap();

    useEffect(() => {
        if (!map){
            console.log("Map not loaded");
             return;};

        if (waypoints && waypoints.length >= 2) {
            const ors = new ORS({
                apiKey: MAPS_API_KEY,
            });

            // Correctly use the waypoints prop
            const orsWaypoints = waypoints.map(coord => [coord[0], coord[1]]); // reverse coords for ORS [lng,lat]

            ors.directions(orsWaypoints, "driving-car")
                .then((d) => {
                    if (d.directions && d.directions.length > 0 && d.directions[0].feature && d.directions[0].feature.geometry) {
                        const coordinates = d.directions[0].feature.geometry.coordinates.map(coord => [coord[1], coord[0]]); // reverse coords for leaflet [lat,lng]
                        
                        console.log("coordinates",coordinates);
                        L.polyline(coordinates, { color: 'red' }).addTo(map);
                    } else {
                        console.error('No valid route data received from ORS.');
                    }
                })
                .catch((error) => {
                    console.error('Error fetching directions:', error);
                });
        }
    }, [map, waypoints]);
    return (
        <>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
        {waypoints.map((point,index)=> <Marker key={index} position={point}><Popup>{index === 0? 'Current Location': index === 1?"Pickup Location": index === waypoints.length -1 ? "Dropoff Location": "Stops"}</Popup></Marker>)}
        </>
    );
}

function LeafletMap({ coordinates }) {
    return (
        <MapContainer center={coordinates && coordinates.length > 0 ? coordinates[0] : [0, 0]} zoom={6} style={{ height: '500px', width: '100%' }}>
            <LeafletORSRoutingMap waypoints={coordinates} />
        </MapContainer>
    );
}

export default LeafletMap;
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

// Posição central inicial do mapa (e.g., centro do Brasil)
const initialPosition = [-15.78, -47.92]; 

const MapChart = () => {
    const [mapMarkers, setMapMarkers] = useState([]);
    
    useEffect(() => {
        const fetchGeoData = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/traffic/topips');
                const data = await response.json();
                
                // Consolida IPs de Origem e Destino em uma lista única de marcadores válidos
                const allMarkers = [
                    ...data.top_destination, 
                    // Usar o IP de origem só faz sentido se for um IP externo
                    ...data.top_source.filter(item => item._id !== '192.168.1.10') // Exemplo: filtre seu IP local
                ]
                    .filter(item => item.location && item.location.latitude) // Filtra apenas IPs com geo-data
                    .map(item => ({
                        position: [item.location.latitude, item.location.longitude],
                        ip: item._id,
                        city: item.location.city,
                        country: item.location.country,
                        count: item.count
                    }));

                setMapMarkers(allMarkers);

            } catch (error) {
                console.error("Erro ao carregar dados do mapa:", error);
            }
        };

        fetchGeoData();
        const interval = setInterval(fetchGeoData, 15000); // Atualiza a cada 15 segundos

        return () => clearInterval(interval);
    }, []);

    // NOTA: Defina uma altura para o mapa em seu CSS (ex: .map-container { height: 400px; })
    return (
        <MapContainer center={initialPosition} zoom={3} style={{ height: '400px', width: '100%' }}>
            {/* TileLayer do OpenStreetMap - Camada de base do mapa */}
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {/* Renderizar os Marcadores (Pins) */}
            {mapMarkers.map((marker, index) => (
                <Marker key={index} position={marker.position}>
                    <Popup>
                        <strong className="has-text-info">{marker.ip}</strong>
                        <br />
                        Local: {marker.city}, {marker.country}
                        <br />
                        Tráfego: {marker.count.toLocaleString()} pacotes
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default MapChart;
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MapComponent = () => {
  const mapRef = useRef(null);

  useEffect(() => {
    let map;
    if (mapRef.current && !map) {
      map = L.map(mapRef.current).setView([51.505, -0.09], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
      
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;

        // Создание маркера
        const marker = L.marker([lat, lng]).addTo(map);

        // Создание всплывающего окна
        const popupContent = `<div>Latitude: ${lat.toFixed(4)}</div><div>Longitude: ${lng.toFixed(4)}</div><button id="addLocationBtn">Добавить место</button>`;
        const popup = L.popup().setContent(popupContent);

        // Привязка всплывающего окна к маркеру
        marker.bindPopup(popup).openPopup();

        // Обработчик события для кнопки во всплывающем окне
        const addLocationBtn = document.getElementById('addLocationBtn');
        if (addLocationBtn) {
          addLocationBtn.addEventListener('click', () => {
            // Здесь можно обработать нажатие на кнопку "Добавить место"
            console.log('Добавить место', lat, lng);
            // Допустим, здесь можно отправить запрос на бэкенд для добавления места
          });
        }
      });
    }

    return () => {
      if (map) {
        map.remove(); // Очистка карты при демонтаже компонента
      }
    };
  }, []);
  const mapStyles = {
    height: '800px',
    width: '100%',
  };

  return <div ref={mapRef} style={mapStyles} className="leaflet-container" />;
};

export default MapComponent;

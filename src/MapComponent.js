import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MapComponent = () => {
  const mapRef = useRef(null);
  const markersRef = useRef([]); 

  useEffect(() => {
    let map;
    if (mapRef.current && !map) {
      map = L.map(mapRef.current).setView([51.505, -0.09], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
      
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;

        markersRef.current.forEach((marker) => {
          map.removeLayer(marker);
        });
        markersRef.current = [];

        // Создание маркера
        const marker = L.marker([lat, lng]).addTo(map);
        markersRef.current.push(marker);

        // Создание всплывающего окна
        const popupContent = `<div>Latitude: ${lat.toFixed(4)}</div><div>Longitude: ${lng.toFixed(4)}</div><button id="addLocationBtn">Добавить место</button>`;
        const popup = L.popup().setContent(popupContent);

        // Привязка всплывающего окна к маркеру
        marker.bindPopup(popup).openPopup();

        // Обработчик события для кнопки во всплывающем окне
        const addLocationBtn = document.getElementById('addLocationBtn');
        if (addLocationBtn) {
          addLocationBtn.addEventListener('click', () => {
            // Отправка POST-запроса на бэкенд при нажатии на кнопку
            fetch('http://localhost:5432/wc/api/location/post', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Connection' : 'keep-alive',
                'Accept-Encoding' : 'gzip, deflate, br',
                'Accept': 'application/json'
              },
              body: JSON.stringify({ 
                latitude: lat, 
                longitude: lng
               }),
            })
              .then((response) => {
                if (response.ok) {
                  console.log('Место успешно добавлено!');
                } else {
                  console.error('Ошибка при добавлении места');
                }
              })
              .catch((error) => {
                console.error('Ошибка сети:', error);
              });
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

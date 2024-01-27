import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const getLocationsInBorders = async (south, west, north, east) => {
  try {
    const response = await fetch('http://localhost:8080/api/location/mapBorder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Connection' : 'keep-alive',
        'Accept-Encoding' : 'gzip, deflate, br',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        south,
        north,
        east,
        west
      }),
    });

    if (!response.ok) {
      throw new Error('Ошибка получения локаций');
    }

    const locations = await response.json();
    return locations;
  } catch (error) {
    console.error('Ошибка запроса локаций:', error);
    return [];
  }
};

const displayMarkers = async (markersRef, map) => {
  const bounds = map.getBounds();
  const southWest = bounds.getSouthWest();
  const northEast = bounds.getNorthEast();
  const south = southWest.lat;
  const west = southWest.lng;
  const north = northEast.lat;
  const east = northEast.lng;

  // Получение локаций в пределах границ карты
  const locations = await getLocationsInBorders(south, west, north, east);

  // Удаление старых маркеров перед обновлением
  markersRef.current.forEach((marker) => map.removeLayer(marker));
  markersRef.current = [];

  // Отображение новых маркеров для каждой локации
  locations.forEach((location) => {
    const marker = L.marker([location.latitude, location.longitude]).addTo(map);
    marker.bindPopup(`<b>${location.name}</b>`);
    markersRef.current.push(marker);
  });
};

const MapComponent = () => {
  const mapRef = useRef(null);
  const markersRef = useRef([]); 

  useEffect(() => {
    let map;
    if (mapRef.current && !map) {
      map = L.map(mapRef.current).setView([51.505, -0.09], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    // Получение координат границ
  
    map.on('moveend', () => displayMarkers(markersRef, map)); // Вызываем displayMarkers при перемещении карты
  
    // Отображаем маркеры при первоначальной загрузке
    displayMarkers(markersRef, map);

    map.on('click', (e) => {
        const { lat, lng } = e.latlng;

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
            map.removeLayer(marker);
            // Отправка POST-запроса на бэкенд при нажатии на кнопку
            fetch('http://localhost:8080/api/location/post', {
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
      map.off('moveend', displayMarkers); // Удаляем обработчик при размонтировании компонента
      if (map) {
        map.remove();
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

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

const displayMarkers = async (newMarkerRef, markersRef, map) => {
  if (!map) {
    console.error("Карта не проинициализирована.");
    return;
  }

  const bounds = map.getBounds();
  const southWest = bounds.getSouthWest();
  const northEast = bounds.getNorthEast();
  const south = southWest.lat;
  const west = southWest.lng;
  const north = northEast.lat;
  const east = northEast.lng;

  // Получение локаций в пределах границ карты
  const newLocations = await getLocationsInBorders(south, west, north, east);
  const oldLocations = markersRef.current;

  let intersection = oldLocations.filter(oldLocation =>
    newLocations.some(newLocation =>
      oldLocation.id === newLocation.id
    )
  );

  const updateTo = newLocations.filter(newLocation =>
    !intersection.some(intersectionLocation =>
      newLocation.id === intersectionLocation.id
    )
  );
  
  const removeTo = oldLocations.filter(oldLocation =>
    !intersection.some(intersectionLocation =>
      oldLocation.id === intersectionLocation.id
    )
  );


      //Удаление старых маркеров перед обновлением
    removeTo.forEach((marker) => {
      if(marker !== newMarkerRef.current){
        map.removeLayer(marker);
      }
    });

      updateTo.forEach((location) => {
      const marker = L.marker([location.latitude, location.longitude]).addTo(map);
      //marker.bindPopup(`<b>${location.name}</b>`);
      markersRef.current.push(marker);
    });

    markersRef.current = markersRef.current.filter(marker => !removeTo.includes(marker));

};

const MapComponent = () => {
  const mapRef = useRef(null);
  const markersRef = useRef([]); 
  let newMarkerRef = useRef(null);

  useEffect(() => {
    let map;
    if (mapRef.current && !map){
      map = L.map(mapRef.current).setView([51.505, -0.09], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        
      // Отображаем маркеры при первоначальной загрузке
      displayMarkers(newMarkerRef, markersRef, map);
      map.on('moveend', () => displayMarkers(newMarkerRef, markersRef, map)); // Вызываем displayMarkers при перемещении карты

      map.on('click', (e) => {

          const { lat, lng } = e.latlng;

          // const removeMarker = markersRef.current.pop();
          // if (removeMarker && map.hasLayer(removeMarker)) {
          //   map.removeLayer(removeMarker);
          // }
          
          // Создание маркера
          if (newMarkerRef && newMarkerRef.current && map.hasLayer(newMarkerRef.current)) {
            map.removeLayer(newMarkerRef.current);
            markersRef.current = markersRef.current.filter(marker => marker !== newMarkerRef.current);
          }

          const marker = L.marker([lat, lng]).addTo(map);
          newMarkerRef.current = marker;
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

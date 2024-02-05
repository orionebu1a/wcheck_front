import React, { useState, useEffect, useRef} from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import customMarkerImage from './/pngwing.com.png';

const width = 13 * 2;
const height = 19 * 2;
const iconSize = [width, height];
const iconAnchor = [0, 0];
const popupAnchor = [0, 0];

const createAddLocationHandler = (lat, lng) => () => {
  const storedToken = localStorage.getItem('token');

  // Отправка POST-запроса на бэкенд при нажатии на кнопку
  fetch('http://localhost:8080/api/location/post', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Connection' : 'keep-alive',
      'Accept-Encoding' : 'gzip, deflate, br',
      'Accept': 'application/json',
      'Authorization': `Bearer ${storedToken}`,
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
};

const getLocationsInBorders = async (south, west, north, east, storedToken) => {
  try {
    const response = await fetch('http://localhost:8080/api/location/mapBorder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Connection' : 'keep-alive',
        'Accept-Encoding' : 'gzip, deflate, br',
        'Accept': 'application/json',
        'Authorization': `Bearer ${storedToken}`,
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

const displayMarkers = async (newMarkerRef, markersRef, map, storedToken, markerLocationMapRef, locationMarkerMapRef, oldLocations, setOldLocations) => {
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
  const newLocations = await getLocationsInBorders(south, west, north, east, storedToken);
  

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
    removeTo.forEach((location) => {
      const marker = locationMarkerMapRef.current[location.id];
      //remove
      if(marker !== newMarkerRef.current){
        if (marker.getPopup()) {
          marker.unbindPopup().closePopup();
        }
        map.removeLayer(marker);
      }
    });

      updateTo.forEach((location) => {
        const marker = L.marker([location.latitude, location.longitude], {
          icon: L.icon({
            iconUrl: customMarkerImage,
            iconSize: [width, height], // укажите размеры изображения
            iconAnchor: [iconAnchor[0], iconAnchor[1]], // укажите якорные точки изображения
            popupAnchor: [popupAnchor[0], popupAnchor[1]], // укажите точку всплывающего окна
          }),
        }).addTo(map);

        const markerId = L.stamp(marker);
        markerLocationMapRef.current[markerId] = location.id;
        locationMarkerMapRef.current[location.id] = marker;

        const popupContent = `
          <div>
            <p>Latitude: ${location.latitude.toFixed(4)}</p>
            <p>Longitude: ${location.longitude.toFixed(4)}</p>
            <p>Votes ${location.votes}</p>
            <button onclick="upvoteLocation(${location.id})">Апвоут</button>
            <button onclick="addPhotoToLocation(${location.id})">Добавить фото</button>
          </div>
        `;

        const popup = L.popup().setContent(popupContent);
        marker.bindPopup(popup);

        markersRef.current.push(marker);
    });

    setOldLocations(newLocations);
    markersRef.current = markersRef.current.filter(marker => !removeTo.includes(marker));

};

const MapComponent = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]); 
  let newMarkerRef = useRef(null);
  const markerLocationMapRef = useRef({});
  const locationMarkerMapRef = useRef({});

  const [oldLocations, setOldLocations] = useState([]);

  const [shouldUpdateLocations, setShouldUpdateLocations] = useState(false);


  // const [addMode, setAddMode] = useState(false);

  // const toggleAddMode = () => {
  //   setAddMode((prevMode) => !prevMode);
  // };

  const [selectedMarker, setSelectedMarker] = useState(null);

  useEffect(() => {
    // Создаем карту при монтировании компонента
    if(!mapRef.current){
      mapRef.current = L.map(mapContainerRef.current).setView([51.505, -0.09], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapRef.current);
    }

    const storedToken = localStorage.getItem('token');

    mapRef.current.off('moveend');
    mapRef.current.on('moveend', () => displayMarkers(newMarkerRef, markersRef, mapRef.current, storedToken, markerLocationMapRef, locationMarkerMapRef, oldLocations, setOldLocations));

    mapRef.current.on('click', (e) => {
      const myMap = mapRef.current;
      const { lat, lng } = e.latlng;
      if (newMarkerRef && newMarkerRef.current && myMap.hasLayer(newMarkerRef.current)) {
        const removedMarker = newMarkerRef.current;
        myMap.removeLayer(removedMarker);
        markersRef.current = markersRef.current.filter(marker => marker !== removedMarker);
      }

      const marker = L.marker([lat, lng]).addTo(myMap);
      newMarkerRef.current = marker;
      markersRef.current.push(marker);

      const oldAddLocationBtn = document.getElementById('addLocationBtn');
      if (oldAddLocationBtn) {
        console.log('Удаляется старая кнопка');
        oldAddLocationBtn.remove();
      }

      const popupContent = `<div>Latitude: ${lat.toFixed(4)}</div><div>Longitude: ${lng.toFixed(4)}</div><button id="addLocationBtn">Добавить место</button>`;
      const popup = L.popup().setContent(popupContent);

      // Привязка всплывающего окна к маркеру
      marker.bindPopup(popup).openPopup();

      // Обработчик события для кнопки во всплывающем окне
      const addLocationBtn = document.getElementById('addLocationBtn');

      if (addLocationBtn) {
        addLocationBtn.addEventListener('click', createAddLocationHandler(lat, lng));
      }
    });

    return () => {
      mapRef.current.off('moveend', displayMarkers);
      mapRef.current.off('click');
      // if (mapRef.current) {
      //   mapRef.current.remove();
      // }
    };
  }, [window.upvoteLocation]);

  window.upvoteLocation = (locationId) => {
    const storedToken = localStorage.getItem('token');
    fetch(`http://localhost:8080/api/location/${locationId}/upvote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Connection' : 'keep-alive',
        'Accept-Encoding' : 'gzip, deflate, br',
        'Accept': 'application/json',
        'Authorization': `Bearer ${storedToken}`,
      }
    })
    .then((response) => {
      if (response.ok) {
        setShouldUpdateLocations(true);
        console.log('Месту добавлен рейтинг!');
      } else {
        console.error('Рейтинг не добавлен');
      }
    })
    .catch((error) => {
      console.error('Ошибка сети:', error);
    });

    console.log(`Upvote location with ID ${locationId}`);
  };

  // useEffect(() => {
  //   // Вызываем displayMarkers при изменении shouldUpdateLocations
  //   if (shouldUpdateLocations) {
  //     displayMarkers(newMarkerRef, markersRef, mapRef.current, localStorage.getItem('token'), markerLocationMapRef, locationMarkerMapRef, oldLocations, setOldLocations);
      
  //     // Сбрасываем shouldUpdateLocations после обновления данных
  //     setShouldUpdateLocations(false);
  //   }
  // }, [shouldUpdateLocations]);


  window.addPhotoToLocation = (locationId) => {
    
    console.log(`Add photo to location with ID ${locationId}`);
  };

  const mapStyles = {
    height: '800px',
    width: '100%',
  };

  const switchStyles = {
    position: 'absolute',
    bottom: '20px',
    left: '20px',
    zIndex: 1000,
    backgroundColor: 'white',
    padding: '10px',
    borderRadius: '5px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
  };

  return (
    <div>
      <div ref={mapContainerRef} style={mapStyles} className="leaflet-container" />
    </div>
  );
};

export default MapComponent;

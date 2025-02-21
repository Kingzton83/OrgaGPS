import { Platform } from 'react-native';

let WebMap;
if (Platform.OS === 'web') {
  const { MapContainer, TileLayer, Marker } = require('react-leaflet');
  require('leaflet/dist/leaflet.css');

  WebMap = ({ latitude, longitude }) => {
    return (
      <MapContainer
        center={[latitude, longitude]}
        zoom={13}
        style={{ height: '250px', width: '100%' }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[latitude, longitude]} />
      </MapContainer>
    );
  };
} else {
  WebMap = () => {
    return null; // Für native Plattformen nichts rendern
  };
}

export default WebMap;

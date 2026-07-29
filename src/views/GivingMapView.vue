<template>

  <div class="app-container">
    <!-- Barra Lateral -->
    <div class="sidebar">
      <div class="header">
        <div class="header-top">
          <BackButton theme="onDark" fallback="/" label="Back" />
          <RouterLink to="/" class="header-logo" aria-label="Giving Back home">
            <img src="/assets/img/reciclar.png" alt="" class="header-logo-img" />
          </RouterLink>
        </div>
        <h2>Giving Map</h2>
        <p>Join the change!</p> 
      </div>

      <div class="section-title">
        <i class="fas fa-building"></i> Partner Companies
      </div>
      <div class="companies-container">
        <button 
          class="company-btn" 
          :class="{ active: activeFilter === 'all' }" 
          @click="filterStores('all')"
        >
          All
        </button>
        <button 
          class="company-btn" 
          :class="{ active: activeFilter === 'dollarcity' }" 
          @click="filterStores('dollarcity')"
        >
          Dollarcity
        </button>
        <button 
          class="company-btn" 
          :class="{ active: activeFilter === 'adoc' }" 
          @click="filterStores('adoc')"
        >
          Adoc
        </button>
      </div>

      <div class="section-title">
        <i class="fas fa-store-alt"></i> Available Branches
      </div>
      
      <div class="stores-list">
        <div 
          v-for="(store, i) in filteredStores" 
          :key="store.id" 
          class="store-card" 
          :style="{ animationDelay: (i * 0.04) + 's' }"
          @click="selectStore(store)"
        >
          <span :class="['badge', `badge-${store.company}`]">{{ store.company }}</span>
          <h4>{{ store.name }}</h4>
          <p>
            <i class="fas fa-map-marker-alt" style="color: #1B5E20; margin-right: 4px;"></i> 
            {{ store.address }}
          </p>
        </div>
      </div>

      <!-- Panel de Información de Ruta -->
      <div v-if="showRouteInfo" class="route-info-panel">
        <h3><i class="fas fa-route"></i> Your Route in Real-Time</h3>
        <div class="info-item">
          <span class="label"><i class="far fa-clock"></i> Estimated Time:</span>
          <span class="value">{{ routeDuration }}</span>
        </div>
        <div class="info-item">
          <span class="label"><i class="fas fa-road"></i> Total Distance:</span>
          <span class="value">{{ routeDistance }}</span>
        </div>
        <button class="clear-btn" @click="clearRoute">
          <i class="fas fa-times"></i> Cancel Route
        </button>
      </div>
    </div>

    <!-- Contenedor del Mapa -->
    <div id="map-container">
      <div id="map"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { RouterLink } from 'vue-router';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import BackButton from '../components/BackButton.vue';


const map = ref(null);
const routingControl = ref(null);
const userLocation = ref(null);
const markersLayer = ref(null);
const activeFilter = ref('all');

// Estado de la ruta
const showRouteInfo = ref(false);
const routeDuration = ref('-- mins');
const routeDistance = ref('-- km');

// Datos de las tiendas oficiales de El Salvador
const storesData = [
  // --- DOLLARCITY ---
  { id: 1, company: 'dollarcity', name: 'Dollarcity Metrocentro San Salvador', address: 'CC Metrocentro, Boulevard Los Héroes, San Salvador', lat: 13.7158, lng: -89.2005 },
  { id: 2, company: 'dollarcity', name: 'Dollarcity Multiplaza', address: 'CC Multiplaza, Antiguo Cuscatlán', lat: 13.6806, lng: -89.2486 },
  { id: 3, company: 'dollarcity', name: 'Dollarcity Metrocentro Santa Ana', address: 'Avenida Independencia Sur CC Metrocentro Santa Ana, 2ª etapa, Local 161, Santa Ana', lat: 13.9774, lng: -89.5641 },
  { id: 6, company: 'dollarcity', name: 'Dollarcity Ramblas', address: 'Centro Comercial Las Ramblas, Carretera Panamericana, Santa Ana', lat: 13.9678, lng: -89.5732 },
  { id: 7, company: 'dollarcity', name: 'Dollarcity El Encuentro Santa Ana', address: 'Carretera a Metapán, El Encuentro Santa Ana, local Mini Ancla 04, Santa Ana, Santa Ana 2201', lat: 13.9995, lng: -89.5484 },
  { id: 8, company: 'dollarcity', name: 'Dollarcity El Encuentro Opico', address: 'km 28 Carretera a Santa Ana Centro Comercial El Encuentro Opico, Mini ancla 1', lat: 13.8214, lng: -89.3512 },

  // --- ADOC ---
  { id: 4, company: 'adoc', name: 'Adoc Metrocentro Santa Ana', address: 'CC Metrocentro Santa Ana Local 142, 143, 144 y 145, Etapa 2, Santa Ana', lat: 13.9781, lng: -89.5645 },
  { id: 5, company: 'adoc', name: 'Adoc Plaza Merliot', address: 'Plaza Merliot, Local 312 y 313, Santa Tecla', lat: 13.6787, lng: -89.2667 },
  { id: 9, company: 'adoc', name: 'ADOC Metrocentro San Salvador', address: 'Metrocentro, Etapa 3, Local 77, 78 B', lat: 13.7162, lng: -89.2012 },
  { id: 10, company: 'adoc', name: 'ADOC La Gran Vía', address: 'Centro Comercial El Gran Bazar, La, Santa Tecla', lat: 13.6739, lng: -89.2524 },
  { id: 11, company: 'adoc', name: 'ADOC • Ahuachapán', address: 'Av. Francisco Menéndez Nte., Ahuachapán 2101', lat: 13.9215, lng: -89.8465 },
  { id: 12, company: 'adoc', name: 'ADOC MetroSur', address: 'Metrosur Local C-313 Etapa 6, San Salvador', lat: 13.7142, lng: -89.2023 }
];

// Computed property para filtrar la lista reactivamente
const filteredStores = computed(() => {
  if (activeFilter.value === 'all') return storesData;
  return storesData.filter(s => s.company === activeFilter.value);
});

onMounted(() => {
  initMap();
});

onBeforeUnmount(() => {
  if (map.value) {
    map.value.remove();
    map.value = null;
  }
});

function initMap() {
  // Inicializar mapa de Leaflet buscando la variable global L
  map.value = L.map('map').setView([13.6929, -89.2182], 10);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map.value);

  markersLayer.value = L.layerGroup().addTo(map.value);

  getDeviceLocation();
  setStoreMarkers();
}

function getDeviceLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      userLocation.value = [position.coords.latitude, position.coords.longitude];

      L.marker(userLocation.value, {
        icon: L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41]
        })
      }).addTo(map.value).bindPopup("<b>Estás aquí</b>").openPopup();

      map.value.setView(userLocation.value, 11);
    }, () => {
      console.log("Geolocalización denegada.");
    });
  }
}

function setStoreMarkers() {
  if (!markersLayer.value) return;
  markersLayer.value.clearLayers();

  filteredStores.value.forEach(store => {
    const color = store.company === 'adoc' ? 'green' : 'red';
    const markerIcon = L.icon({
      iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41]
    });

    const marker = L.marker([store.lat, store.lng], { icon: markerIcon })
      .bindPopup(`<b>${store.name}</b>`);

    marker.on('click', () => selectStore(store));
    markersLayer.value.addLayer(marker);
  });
}

function filterStores(company) {
  activeFilter.value = company;
  setStoreMarkers();
}

function selectStore(store) {
  if (!userLocation.value) {
    alert("Habilita los permisos de ubicación para calcular la ruta.");
    return;
  }

  if (routingControl.value) {
    map.value.removeControl(routingControl.value);
  }

  routingControl.value = L.Routing.control({
    waypoints: [
      L.latLng(userLocation.value[0], userLocation.value[1]),
      L.latLng(store.lat, store.lng)
    ],
    router: L.Routing.osrmv1({
      serviceUrl: `https://router.project-osrm.org/route/v1`
    }),
    createMarker: function() { return null; }, 
    lineOptions: {
      styles: [{ color: '#1B5E20', opacity: 0.8, weight: 6 }]
    },
    show: false
  }).addTo(map.value);

  routingControl.value.on('routesfound', function(e) {
    const routes = e.routes;
    const summary = routes[0].summary;

    const timeInMinutes = Math.round(summary.totalTime / 60);
    const distanceInKm = (summary.totalDistance / 1000).toFixed(1);

    routeDuration.value = `${timeInMinutes} minutos`;
    routeDistance.value = `${distanceInKm} km`;
    showRouteInfo.value = true;
  });
}

function clearRoute() {
  if (routingControl.value) {
    map.value.removeControl(routingControl.value);
    routingControl.value = null;
  }
  showRouteInfo.value = false;
  if (userLocation.value) map.value.setView(userLocation.value, 11);
}
</script>

<style scoped>
* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

body, html {
    height: 100%;
    background-color: #f4f6f7;
}

.app-container {
    display: flex;
    height: 100vh;
    width: 100vw;
}

.sidebar {
    width: 380px;
    background-color: #ffffff;
    box-shadow: 4px 0 20px rgba(0, 0, 0, 0.06);
    display: flex;
    flex-direction: column;
    z-index: 999;
}

.header {
    background-color: #0D2B0D;
    color: #ffffff;
    padding: 22px 24px 28px;
    text-align: center;
    border-bottom: 5px solid #133a13;
}

.header-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 18px;
}

.header-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.92;
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.header-logo:hover {
    opacity: 1;
    transform: scale(1.05);
}

.header-logo-img {
    height: 26px;
    width: auto;
    filter: brightness(0) invert(1);
}

.header h2 {
    font-size: 28px;
    font-weight: 700;
    letter-spacing: 0.5px;
}

.header p {
    font-size: 14px;
    opacity: 0.85;
    margin-top: 10px;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 700;
    color: #B8E6B8;
}

.section-title {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    color: #1B5E20; 
    padding: 22px 24px 6px 24px;
    font-weight: 700;
}

.companies-container {
    display: flex;
    gap: 10px;
    padding: 5px 24px 15px 24px;
}

.company-btn {
    flex: 1;
    padding: 11px;
    border: 2px solid #2E7D32; 
    border-radius: 25px; 
    background-color: #ffffff;
    color: #2E7D32;
    cursor: pointer;
    font-weight: 700;
    font-size: 13px;
    transition: background-color 0.2s ease, color 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
    outline: none;
    text-align: center;
}

.company-btn:hover {
    background-color: #E8F5E9; 
    transform: translateY(-2px);
}

.company-btn:active {
    transform: translateY(0) scale(0.97);
}

.company-btn.active {
    background-color: #2E7D32;
    color: #ffffff;
    border-color: #2E7D32;
    box-shadow: 0 4px 12px rgba(46, 125, 50, 0.28);
}

.stores-list {
    flex: 1;
    overflow-y: auto;
    padding: 10px 24px;
}

.stores-list::-webkit-scrollbar {
    width: 5px;
}
.stores-list::-webkit-scrollbar-thumb {
    background-color: #C8E6C9;
    border-radius: 10px;
}

.store-card {
    background: #ffffff;
    border: 1.5px solid #E0E0E0;
    border-radius: 14px;
    padding: 16px;
    margin-bottom: 14px;
    cursor: pointer;
    transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
    animation: store-card-in 0.4s ease backwards;
}

@keyframes store-card-in {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
}

.store-card:hover {
    transform: translateY(-3px);
    border-color: #2E7D32;
    box-shadow: 0 8px 18px rgba(27, 94, 32, 0.12);
}

.store-card:active {
    transform: translateY(-1px) scale(0.99);
}

.store-card h4 {
    color: #1B5E20; 
    font-size: 15px;
    font-weight: 700;
    margin-bottom: 5px;
}

.store-card p {
    color: #555555;
    font-size: 12.5px;
    line-height: 1.4;
}

.badge {
    display: inline-block;
    padding: 4px 10px;
    font-size: 9.5px;
    font-weight: 800;
    border-radius: 6px;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.badge-dollarcity {
    background-color: #FFF8E1;
    color: #8F5405;
    border: 1px solid #FFE082;
}

.badge-adoc {
    background-color: #E8F5E9;
    color: #1B5E20;
    border: 1px solid #C8E6C9;
}

.route-info-panel {
    background-color: #E8F5E9; 
    border-top: 4px solid #1B5E20;
    padding: 20px;
    box-shadow: 0 -5px 15px rgba(0,0,0,0.04);
    animation: store-card-in 0.3s ease;
}

.route-info-panel h3 {
    font-size: 15px;
    color: #1B5E20;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 700;
}

.info-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 14px;
}

.info-item .label {
    color: #1B5E20;
    font-weight: 600;
}

.info-item .value {
    font-weight: 700;
    color: #1B5E20;
}

.clear-btn {
    width: 100%;
    padding: 11px;
    background-color: #C62828;
    color: #ffffff;
    border: none;
    border-radius: 25px;
    cursor: pointer;
    margin-top: 10px;
    font-weight: 700;
    font-size: 13px;
    transition: background-color 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
}

.clear-btn:hover {
    background-color: #B71C1C;
    transform: translateY(-2px);
    box-shadow: 0 6px 14px rgba(198, 40, 40, 0.3);
}

.clear-btn:active {
    transform: translateY(0) scale(0.98);
}

#map-container {
    flex: 1;
    position: relative;
    height: 100vh;
    width: 100%;
}

#map {
    height: 100%;
    width: 100%;
}

@media (max-width: 768px) {
    .app-container {
        flex-direction: column-reverse;
    }

    .sidebar {
        width: 100%;
        height: 50vh;
        border-radius: 24px 24px 0 0;
        box-shadow: 0 -8px 24px rgba(0,0,0,0.1);
    }

    #map-container {
        height: 50vh;
    }

    .header {
        padding: 16px;
    }

    .header-top {
        margin-bottom: 10px;
    }

    .header h2 {
        font-size: 22px;
    }
}

@media (prefers-reduced-motion: reduce) {
    .store-card,
    .route-info-panel {
        animation: none;
    }
    .company-btn,
    .clear-btn,
    .store-card,
    .header-logo {
        transition: none;
    }
    .company-btn:hover,
    .clear-btn:hover,
    .store-card:hover,
    .header-logo:hover {
        transform: none;
    }
}
</style>

import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
declare global {
  namespace L {
    namespace Routing {
      function osrmv1(options: any): any;
      function control(options: any): any;
    }
  }
}

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
  standalone: true
})
export class MapComponent implements AfterViewInit {

  private map!: L.Map;
  private userMarker!: L.Marker;
  private routeControl: any;

  // Stations de police
  policeStations = [
    { name: "Police Plateau", lat: 14.667, lng: -17.434 },
    { name: "Police Médina", lat: 14.693, lng: -17.451 },
    { name: "Police Parcelles", lat: 14.759, lng: -17.444 }
  ];

  ngAfterViewInit(): void {
    // Initialisation de la carte
    this.map = L.map('mapContainer').setView([14.7167, -17.4677], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    // Géolocalisation
    this.getUserLocation();
  }

  public getUserLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        // Marker utilisateur
        this.userMarker = L.marker([lat, lng], {
          icon: L.icon({
            iconUrl: 'station.png',
            iconSize: [30,30],
            iconAnchor: [15,30],
            popupAnchor: [0,-30]
          })
        }).addTo(this.map).bindPopup("Votre position").openPopup();

        this.map.setView([lat, lng], 13);

        // Ajouter stations
        this.policeStations.forEach(station => this.addMarker(station.lat, station.lng, station.name));

        // Station la plus proche
        const closest = this.findClosestStation(lat, lng);
        if (closest) {
          this.addMarker(closest.lat, closest.lng, closest.name, true);
          this.calculateRoute(closest.lat, closest.lng, closest.name);
        }

      }, () => alert("Impossible de récupérer votre position !"));
    } else {
      alert("La géolocalisation n’est pas supportée par votre navigateur.");
    }
  }

  private addMarker(lat: number, lng: number, name: string, isClosest: boolean = false): L.Marker {
    const icon = L.icon({
      iconUrl: isClosest ? 'station.png' : 'station.png',
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30]
    });

    const marker = L.marker([lat, lng], { icon }).addTo(this.map).bindPopup(name);

    marker.on('click', () => this.calculateRoute(lat, lng, name));
    return marker;
  }

  private findClosestStation(userLat: number, userLng: number) {
    let minDistance = Infinity;
    let closestStation: any = null;

    this.policeStations.forEach(station => {
      const distance = this.getDistance(userLat, userLng, station.lat, station.lng);
      if (distance < minDistance) {
        minDistance = distance;
        closestStation = station;
      }
    });

    return closestStation;
  }

  private getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private calculateRoute(destLat: number, destLng: number, name: string): void {
    if (!this.userMarker) return;

    const userLat = this.userMarker.getLatLng().lat;
    const userLng = this.userMarker.getLatLng().lng;

    if (this.routeControl) {
      this.map.removeControl(this.routeControl);
    }

    this.routeControl = L.Routing.control({
      waypoints: [
        L.latLng(userLat, userLng),
        L.latLng(destLat, destLng)
      ],
      lineOptions: { styles: [{ color: '#FF7F50', weight: 5 }] },
      router: L.Routing.osrmv1({ serviceUrl: 'https://router.project-osrm.org/route/v1' }),
      createMarker: (i: number, wp: any) => {
        return i === 0
          ? L.marker(wp.latLng, { icon: L.icon({ iconUrl:'station.png', iconSize:[30,30] }) })
          : L.marker(wp.latLng, { icon: L.icon({ iconUrl:'station.png', iconSize:[30,30] }) });
      }
    }).addTo(this.map);

    this.routeControl.on('routesfound', (e: any) => {
      const route = e.routes[0];
      const distanceKm = (route.summary.totalDistance / 1000).toFixed(1);
      const durationMin = Math.round(route.summary.totalTime / 60);

      const routeInfoDiv = document.getElementById('routeInfo');
      if (routeInfoDiv) {
        routeInfoDiv.innerHTML = `
          <strong>Itinéraire vers ${name}</strong><br>
          🚗 En voiture: ${durationMin} min (${distanceKm} km)
        `;
        routeInfoDiv.style.display = 'block';
        setTimeout(() => routeInfoDiv.style.display = 'none', 10000);
      }
    });
  }

}
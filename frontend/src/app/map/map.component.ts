import { Component, AfterViewInit } from '@angular/core';

declare var H: any;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
  standalone: true,
})
export class MapComponent implements AfterViewInit {
  private platform: any;
  private map: any;
  private userMarker: any;
  private routeLine: any;
  private routingService: any;

  constructor() {
    this.platform = new H.service.Platform({
      apikey: 'nPg3OLPnob_rqOI_j_XuUa82LkHI1RcWdFgL0qSWT80',
    });
  }

  ngAfterViewInit(): void {
    const defaultLayers = this.platform.createDefaultLayers();
    this.map = new H.Map(
      document.getElementById('mapContainer'),
      defaultLayers.vector.normal.map,
      { zoom: 12, center: { lat: 14.4974, lng: -14.4524 } }
    );

    new H.mapevents.Behavior(new H.mapevents.MapEvents(this.map));
    H.ui.UI.createDefault(this.map, defaultLayers);
    this.routingService = this.platform.getRoutingService(null, 8);

    this.getUserLocation();
  }

  private addMarker(lat: number, lng: number, name: string): void {
    const svgCircle = `<svg width="30" height="30" xmlns="http://www.w3.org/2000/svg">
        <circle cx="15" cy="15" r="10" stroke="green" stroke-width="3" fill="none"/>
      </svg>`;
    const icon = new H.map.Icon(svgCircle, { size: { w: 30, h: 30 } });
    const marker = new H.map.Marker({ lat, lng }, { icon });

    marker.addEventListener('tap', () => this.calculateRoute(lat, lng, name));
    this.map.addObject(marker);
  }

  private fetchPoliceStations(lat: number, lng: number): void {
    const service = this.platform.getSearchService();
    service.discover(
      { q: 'police station', at: `${lat},${lng}`, limit: 10, in: 'countryCode:SEN' },
      (result: any) => {
        result.items.forEach((item: any) => this.addMarker(item.position.lat, item.position.lng, item.title));
      },
      alert
    );
  }

  private getUserLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;

          const userSvg = `<svg width="30" height="30" xmlns="http://www.w3.org/2000/svg">
              <circle cx="15" cy="15" r="10" stroke="orange" stroke-width="3" fill="none"/>
            </svg>`;
          const userIcon = new H.map.Icon(userSvg, { size: { w: 30, h: 30 } });
          this.userMarker = new H.map.Marker({ lat: userLat, lng: userLng }, { icon: userIcon });

          this.map.addObject(this.userMarker);
          this.map.setCenter({ lat: userLat, lng: userLng });

          this.fetchPoliceStations(userLat, userLng);
        },
        () => alert('Impossible de récupérer votre position !')
      );
    } else {
      alert('La géolocalisation n’est pas supportée par votre navigateur.');
    }
  }

  private calculateRoute(destLat: number, destLng: number, name: string): void {
    if (!this.userMarker) {
      alert('Position utilisateur inconnue !');
      return;
    }

    const userPos = this.userMarker.getGeometry();
    const userLat = userPos.lat;
    const userLng = userPos.lng;

    if (this.routeLine) {
      this.map.removeObject(this.routeLine);
    }

    this.routingService.calculateRoute(
      {
        routingMode: 'fast',
        transportMode: 'car',
        origin: `${userLat},${userLng}`,
        destination: `${destLat},${destLng}`,
        return: 'polyline,summary'
      },
      (result: any) => {
        if (result.routes.length) {
          const route = result.routes[0];
          const summary = route.sections[0].summary;

          this.drawRoute(route.sections[0].polyline);
          this.showRouteInfo(name, summary.length / 1000, summary.duration / 60);
        }
      },
      () => alert('Impossible de calculer l’itinéraire !')
    );
  }

  private drawRoute(polyline: string): void {
    const lineString = H.geo.LineString.fromFlexiblePolyline(polyline);
    this.routeLine = new H.map.Polyline(lineString, {
      style: { strokeColor: '#00BFFF', lineWidth: 8, lineDash: [2, 1] }
    });

    this.map.addObject(this.routeLine);
    this.map.getViewModel().setLookAtData({ bounds: this.routeLine.getBoundingBox() });
  }

  private showRouteInfo(name: string, distance: number, timeByCar: number): void {
    // Sélectionne la div qui affichera les informations
    const routeInfoDiv = document.getElementById('routeInfo');
    
    if (routeInfoDiv) {
      routeInfoDiv.innerHTML = `
        <strong>Itinéraire vers ${name}</strong><br>
        🚗 <strong>En voiture :</strong> ${Math.round(timeByCar)} min (${distance.toFixed(1)} km) <br>
        🚶‍♂️ <strong>À pied :</strong> ${Math.round(timeByCar * 3)} min (${distance.toFixed(1)} km)
      `;
      routeInfoDiv.style.display = 'block';
  
      // Masque les informations après 10 secondes
      setTimeout(() => {
        routeInfoDiv.style.display = 'none';
      }, 10000); // 10000 ms = 10 secondes
    }
  }
  
}

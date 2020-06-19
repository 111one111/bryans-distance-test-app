import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { RestService } from 'src/app/services/rest.service';
import { GeoLocationService } from 'src/app/services/geo-location.service';
import { Location } from 'src/app/interfaces/location.interface';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  buttonText = 'Start recording location';
  locationTimer;
  gatheredData: Location[] = [];
  locationId;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private geo: GeoLocationService,
    private restService: RestService
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  /**
   * used to activate and deactivate getting location data.
   */
  recordLocation() {
    if (this.locationTimer === undefined){
      this.buttonText = 'Recording Started, Press to stop';
      this.locationTimer = setInterval(() => this.saveLocation(), 15000);
      this.locationId = 'myLocation' + Date.now();
      this.saveLocation();
    } else {
      clearInterval(this.locationTimer);
      this.sendLocationData();
    }
  }

  /**
   * Sends data to the server
   */
  sendLocationData(){
    this.locationTimer = undefined;
    this.buttonText = 'Start recording location';
    this.restService.postRequest(environment.api, this.gatheredData)
      .subscribe(response => { });
    this.gatheredData = [];
  }

  /**
   * Gets Location and saves to component local array.
   */
  saveLocation() {
    this.geo.getLocation().then(position => {
      const coord: Location = {
        Lat: position.lat,
        Lng: position.lng,
        Id: this.locationId
      };

      if (coord === null){
        return;
      }

      if (this.gatheredData.includes(coord)){
        return;
      }
      this.gatheredData.push(coord);
    });
  }
}

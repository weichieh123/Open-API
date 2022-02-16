<template>
  <div id="bus-line">
    <div class="left" :class="{ scroll: this.busList.length }">
      <h1>公車路線查詢頁</h1>
      <div class="search">
        <select v-model="selectedCity" name="selectedCity" id="selectedCity">
          <option
            v-for="(option, index) in cityOptions"
            :value="option.value"
            :key="index"
          >
            {{ option.text }}
          </option>
        </select>
        <button @click="searchBus">搜尋BUS路線</button>
      </div>

      <div class="bus-list" :class="{ scroll: this.busList.length }">
        <BusLineItem
          v-for="(bus, index) in busList"
          :key="index"
          :bus="bus"
          @choose="chooseBus(index)"
        />
      </div>
    </div>
    <div class="right">
      <div id="map"></div>
    </div>
  </div>
</template>

<script>
import L from 'leaflet';
import axios from 'axios';
import BusLineItem from './BusLineItem.vue';
import cityOptions from '@/store/cityOptions.js';
import jsSHA from "jssha" ;
// 設定空物件
// TODO: reset舊的路線標記
let openStreetMap = {};

let myStyle = {
  color: '#ff7800',
  weight: 5,
  opacity: 0.65,
};

export default {
  name: 'BusStop',
  components: {
    BusLineItem,
  },
  data() {
    return {
      selectedCity: '', //所選之城市
      selectedBus: '', //所選擇之bus
      busList: [], //列出此城市(selectedCity)之所有bus選項
      busRoutes: [], //此巴士(selectedBus)之所有站牌資料
      busRoutesGeometry: [], //此巴士(selectedBus)之路線經緯度資料
      cityOptions: cityOptions, //城市選項資料
    };
  },
  mounted() {
    openStreetMap = L.map('map', {
      center: [24.755292, 121.7495626],
      zoom: 14, //縮放比例
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
      maxZoom: 20,
    }).addTo(openStreetMap);
    // L.geoJSON(geojsonFeature).addTo(openStreetMap);
    // console.log(process.env.VUE_APP_ID, process.env.VUE_APP_KEY);
  },
  methods: {
    GetAuthorizationHeader() {
      let AppID = process.env.VUE_APP_ID;
      let AppKey = process.env.VUE_APP_KEY;

      let GMTString = new Date().toGMTString();
      let ShaObj = new jsSHA('SHA-1', 'TEXT');
      ShaObj.setHMACKey(AppKey, 'TEXT');
      ShaObj.update('x-date: ' + GMTString);
      let HMAC = ShaObj.getHMAC('B64');
      let Authorization =
        'hmac username="' +
        AppID +
        '", algorithm="hmac-sha1", headers="x-date", signature="' +
        HMAC +
        '"';

      return {
        Authorization: Authorization,
        'X-Date': GMTString /*,'Accept-Encoding': 'gzip'*/,
      }; //如果要將js運行在伺服器，可額外加入 'Accept-Encoding': 'gzip'，要求壓縮以減少網路傳輸資料量
    },
    searchBus() {
      // 搜尋此城市(selectedCity)之所有BUS，存至busList，並增加一個欄位isActive作為tag class highlight依據
      axios
        .get(
          'https://ptx.transportdata.tw/MOTC/v2/Bus/Route/City/' +
            this.selectedCity,
          {
            params: {
              top: '30',
              format: 'JSON',
            },
            headers: this.GetAuthorizationHeader(),
          }
        )
        .then((res) => {
          this.busList = res.data;
          this.busList.forEach((obj) => (obj.isActive = false));
          console.log('searchBus()的res.data:', this.busList);
        })
        .catch((error) => {
          console.log(error);
        });
    },
    searchBusRoute() {
      // call 兩個API，獲得站牌&路線經緯度
      // call updateMap()，將資料更新並標示在地圖上
      let stopRouteURL =
        'https://ptx.transportdata.tw/MOTC/v2/Bus/StopOfRoute/City/';
      let routeGeoURL = 'https://ptx.transportdata.tw/MOTC/v2/Bus/Shape/City/';
      let regex = /([0-9]+\.[0-9]+) ([0-9]+\.[0-9]+)/g;
      axios
        .all([
          axios.get(stopRouteURL + this.selectedCity + '/' + this.selectedBus, {
            params: {
              top: '30',
              format: 'JSON',
            },
            headers: this.GetAuthorizationHeader(),
          }),
          axios.get(routeGeoURL + this.selectedCity + '/' + this.selectedBus, {
            params: {
              top: '30',
              format: 'JSON',
            },
            headers: this.GetAuthorizationHeader(),
          }),
        ])
        .then(
          axios.spread((res1, res2) => {
            this.busRoutes = res1.data[0];
            console.log('selectedCity:', this.selectedCity);
            console.log('selectedBus之所有站牌資料,來自res1:', this.busRoutes);
            // 更新地圖原點，以busRoutes.Stops第一筆站牌之經緯度為中心
            openStreetMap.panTo(
              new L.LatLng(
                this.busRoutes.Stops[0].StopPosition.PositionLat,
                this.busRoutes.Stops[0].StopPosition.PositionLon
              )
            );
            let data = res2.data[0];
            let geoStr = data.Geometry;
            // 將string改為array of arrays格式
            this.busRoutesGeometry = geoStr
              .match(regex)
              .map((item) => item.split(' ').map((item) => Number(item)));
            console.log('selectedBus之路線經緯度資料:', this.busRoutesGeometry);
            this.updateMap();
          })
        )
        .catch((error) => {
          console.log(error);
        });
    },
    updateMap() {
      // ADD
      let geoLayer, layerGroup;
      if (this.selectedBus && geoLayer) {
        console.log('清除上一筆路線');
        layerGroup.removeLayer(geoLayer);
      }
      // clear markers
      openStreetMap.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          openStreetMap.removeLayer(layer);
        }
      });
      let busRouteName = this.busRoutes.RouteName.Zh_tw;
      this.busRoutes.Stops.forEach((bus) => {
        //透過busRoutes.Stops經緯度疊加標記
        L.marker([bus.StopPosition.PositionLat, bus.StopPosition.PositionLon])
          .addTo(openStreetMap)
          .bindPopup(
            `<h3><strong>${bus.StopName.Zh_tw}</strong></h3>
          <strong style=" color: #3687f0;">公車：${busRouteName}</strong>
          `
          );
      });
      let myLines = [
        {
          type: 'LineString',
          coordinates: this.busRoutesGeometry,
        },
      ];
      // ADD
      // let geoLayer = L.geoJSON().addTo(openStreetMap);
      geoLayer = L.geoJSON(myLines, {
        style: myStyle,
      }).addTo(openStreetMap);
      layerGroup = new L.LayerGroup();
      layerGroup.addTo(openStreetMap);
      layerGroup.addLayer(geoLayer);
      // geoLayer.addData(myLines, {
      //   style: myStyle,
      // });
    },
    chooseBus(index) {
      // 按下Bus後，將所選的bus存至selectedBus，並將tag highlight
      // call searchBusRoute，獲取selectedBus的更多資訊(站牌,路線經緯度)
      this.busList.forEach((obj) => (obj.isActive = false)); //reset isActive
      this.busList[index].isActive = true; //被選到的bus會highlight
      this.selectedBus = this.busList[index].RouteName.Zh_tw;
      console.log('更新的busList:', this.busList);
      console.log('選擇的bus:', this.selectedBus);
      this.searchBusRoute();
    },
  },
};
</script>

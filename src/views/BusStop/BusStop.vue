<template>
  <div id="bus-stop">
    <div class="left" :class="{scroll: this.busList.length}">
      <h1>公車站牌查詢頁</h1>
      <div class="search">
        <select v-model="city" name="city" id="city">
          <option
            v-for="(option, index) in cityOptions"
            :value="option.value"
            :key="index"
          >
            {{ option.text }}
          </option>
        </select>
        <button @click="searchBusStop">搜尋BUS站牌</button>
      </div>
      <div class="bus-list" :class="{scroll: this.busList.length}">
        <BusStopItem
          v-for="(bus, index) in busList"
          :key="index"
          :bus="bus"
          @origin="updateOrigin(index)"
        />
      </div>
    </div>
    <div class="right">
      <div id="map"></div>
    </div>
  </div>
</template>

<script>
import L from "leaflet";
import axios from "axios";
import BusStopItem from "./BusStopItem.vue";
import cityOptions from "@/store/cityOptions.js"
// 設定空物件
let openStreetMap = {};

export default {
  name: "BusStop",
  components: {
    BusStopItem,
  },
  data() {
    return {
      city: "",
      busList: [],
      cityOptions: cityOptions,
    };
  },
  mounted() {
    openStreetMap = L.map("map", {
      center: [24.755292, 121.7495626],
      zoom: 14, //縮放比例
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 20,
    }).addTo(openStreetMap);
  },
  methods: {
    searchBusStop() {
      axios
        .get(
          "https://ptx.transportdata.tw/MOTC/v2/Bus/Station/City/" + this.city,
          {
            params: {
              top: "30",
              format: "JSON",
            },
          }
        )
        .then((res) => {
          this.busList = res.data;
          console.log("res.data:", this.busList);
          // 更新地圖原點，以busList第一筆站牌之經緯度為中心
          openStreetMap.panTo(
            new L.LatLng(
              this.busList[0].StationPosition.PositionLat,
              this.busList[0].StationPosition.PositionLon
            )
          );
          this.updateMap();
        })
        .catch((error) => {
          console.log(error);
        });
    },
    updateMap() {
      // clear markers
      openStreetMap.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          openStreetMap.removeLayer(layer);
        }
      });
      this.busList.forEach((bus) => {
        //透過busStop經緯度疊加標記
        L.marker([
          bus.StationPosition.PositionLat,
          bus.StationPosition.PositionLon,
        ])
          .addTo(openStreetMap)
          .bindPopup(
            `<h3><strong>${bus.StationName.Zh_tw}</strong></h3>
          <strong style=" color: #3687f0;">公車：${bus.Stops[0].RouteName.Zh_tw}</strong>
          `
          );
      });
    },
    updateOrigin(index) {
      openStreetMap.panTo(
        new L.LatLng(
          this.busList[index].StationPosition.PositionLat,
          this.busList[index].StationPosition.PositionLon
        )
      );
    },
  },
};
</script>

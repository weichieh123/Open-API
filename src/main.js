import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";

createApp(App).use(store).use(router).mount("#app");

/*
    BusStop: 查詢縣市的公車站牌
    BusLine: 查詢縣市公車之路線
    cityOptions: 縣市資料
*/
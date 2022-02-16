// import { createRouter, createWebHistory } from "vue-router";
import { createRouter, createWebHashHistory } from 'vue-router'
import Home from "../views/Home.vue";


const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/bus-stop",
    name: "BusStop",
    props: true,
    component: () => import(/* webpackChunkName: "BusStop" */ "../views/BusStop/BusStop.vue"),
  },
  {
    path: "/bus-line",
    name: "BusLine",
    props: true,
    component: () => import(/* webpackChunkName: "BusStop" */ "../views/BusLine/BusLine.vue"),
  },
];

const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL),
  routes,
});

export default router;

/* eslint-disable vue/no-multiple-template-root */
<template>
  <body>
    <div id="nav">
      <router-link to="/">Home</router-link> |
      <!-- <router-link to="/bus-stop">Bus Stop</router-link> | -->
      <router-link to="/bus-line">Bus Line</router-link>
    </div>
    <router-view />
    <Footer />
  </body>
</template>

<script>
import Footer from './views/Footer.vue';

export default {
  name: 'App',
  components: {
    Footer,
  },
};
</script>

<style lang="scss">
@import './styles/bus.scss';
</style>

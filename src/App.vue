<template>
  <header>
    <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/bus-stop">Bus Stop</router-link> |
      <router-link to="/bus-line">Bus Line</router-link>
    </div>
    <router-view />
  </header>
</template>



<style lang="scss">
@import './styles/bus.scss';

</style>

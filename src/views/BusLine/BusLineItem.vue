<template>
  <div class="bus-item" @click="$emit('choose')">
    <div class="bus-tag" :class="{active: bus.isActive}">
      {{ bus.RouteName.Zh_tw }}
    </div>
    {{ bus.DepartureStopNameZh }}→{{ bus.DestinationStopNameZh }}
  </div>
</template>

<script>
export default {
  name: "BusLineItem",
  props: ["bus"],
};
</script>

<style lang="scss" scoped>
.bus-item {
    display: flex;
    .bus-tag {
        background-color: #42b983;
        color: white;
        margin-right: 1rem;
        padding: 0 0.5rem;
        &.active {
          background-color: #e67272;
        }
    }

}
</style>

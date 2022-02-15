<template>
  <div class="bus-item" @click="$emit('origin')" :class="{active: bus.isActive}">
    {{ bus.StationName.Zh_tw }}
  </div>
</template>

<script>
export default {
    name: "BusStopItem",
    props: ["bus"]
}
</script>
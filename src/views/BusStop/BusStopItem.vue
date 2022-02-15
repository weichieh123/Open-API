<template>
  <div class="bus-item" @click="$emit('origin')">
    {{ bus.StationName.Zh_tw }}
  </div>
</template>

<script>
export default {
    name: "BusStopItem",
    props: ["bus"]
}
</script>

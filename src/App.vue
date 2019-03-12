<template>
  <div>
    <router-view />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { theme } from '@/store'

export default Vue.extend({
  name: 'App',
  computed: {
    theme(): theme {
      return this.$store.state.theme
    }
  },
  watch: {
    theme: {
      handler(newVal) {
        document.documentElement.className = newVal
      },
      immediate: true
    }
  }
})
</script>

<style lang="scss">
@import 'sass/style';
</style>

<template>
  <div class="home">
    <nav>
      <router-link to="/command-list">CommandList</router-link> |
      <router-link to="/path-list">PathList</router-link>
    </nav>

    <repos-table />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import ReposTable from './ReposTable/ReposTable.vue'

export default Vue.extend({
  name: 'Index',
  components: {
    ReposTable
  }
})
</script>

<style lang="scss" scoped>
nav {
  margin: -6px 0 6px;
}
</style>

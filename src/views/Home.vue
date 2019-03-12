<template>
  <div class="home">
    <nav>
      <router-link to="/command-list">CommandList</router-link> |
      <router-link to="/path-list">PathList</router-link>
    </nav>

    <img alt="Vue logo" src="../assets/logo.png" />
    <HelloWorld msg="Welcome to Your Vue.js + TypeScript App" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import HelloWorld from '@/components/HelloWorld.vue' // @ is an alias to /src

export default Vue.extend({
  name: 'Home',
  components: {
    HelloWorld
  }
})
</script>

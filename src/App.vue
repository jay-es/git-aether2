<template>
  <div @contextmenu="oncontextmenu">
    <router-view />
  </div>
</template>

<script lang="ts">
import { remote } from 'electron'
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
  },
  methods: {
    // テキスト入力の右クリックメニュー
    oncontextmenu(e: MouseEvent) {
      const el = e.target as HTMLInputElement

      if (el.disabled) return

      if (
        el.classList.contains('j-input') ||
        el.classList.contains('j-textarea')
      ) {
        remote.Menu.buildFromTemplate([
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
          { role: 'selectAll' },
          { role: 'delete' }
        ]).popup()
      }
    }
  }
})
</script>

<style lang="scss">
@import 'sass/style';
</style>

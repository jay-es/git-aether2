<template>
  <div class="cell">
    {{ repo.basePath }}<br />
    <p class="changes">
      <template v-if="changesNum">
        <a @click="openDiff">{{ changesText }}</a>
      </template>
      <template v-else>
        {{ changesText }}
      </template>
    </p>
  </div>
</template>

<script lang="ts">
import { remote } from 'electron'
import Vue from 'vue'
import Git from '@/scripts/Git'

export default Vue.extend({
  props: {
    repo: {
      type: Object as () => Git,
      required: true
    }
  },
  computed: {
    changesNum(): number {
      const { files } = this.repo.statusResult
      return files ? files.length : 0
    },
    changesText(): string {
      if (this.changesNum === 0) return 'no changes'
      if (this.changesNum === 1) return '1 change'
      return `${this.changesNum} changes`
    }
  },
  methods: {
    openDiff() {
      // ウィンドウ位置を復元
      const bounds = JSON.parse(localStorage.getItem('winPos:diff') || '{}')

      const win = new remote.BrowserWindow(Object.assign({}, bounds))

      if (process.env.NODE_ENV !== 'production') {
        setTimeout(win.webContents.openDevTools, 600)
      } else {
        win.setMenu(null)
      }

      win.loadURL(`${location.href}diff-view?basePath=${this.repo.basePath}`)

      // クローズ時にウィンドウ位置を保存
      win.on('close', () => {
        localStorage.setItem('winPos:diff', JSON.stringify(win.getBounds()))
      })
    }
  }
})
</script>

<style lang="scss" scoped>
.changes {
  display: inline-block;
  margin: 0.5em 0 0;
}
</style>

<template>
  <div class="cell" @contextmenu="popupMenu">
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
import { remote, shell } from 'electron'
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
      // Diffウィンドウがあったらフォーカスして終了
      const oldWindow = remote.BrowserWindow.getAllWindows().find(v =>
        v.getTitle().startsWith(`${this.repo.basePath} `)
      )
      if (oldWindow) {
        oldWindow.focus()
        return
      }

      // ウィンドウ位置を復元
      const bounds = JSON.parse(localStorage.getItem('winPos:diff') || '{}')

      const win = new remote.BrowserWindow(
        Object.assign(bounds, {
          icon: __static + '/favicon.ico',
          autoHideMenuBar: true
        })
      )

      win.loadURL(`${location.href}diff-view?basePath=${this.repo.basePath}`)
    },
    popupMenu() {
      const menuItems: Electron.MenuItemConstructorOptions[] = [
        {
          label: 'Git',
          submenu: [
            {
              label: 'fetch --all --prune',
              click: () => this.$parent.$emit('fetchAllPrune')
            }
          ]
        }
      ]

      if (this.repo.github) {
        const githubUrl = `https://github.com/${this.repo.github}`

        menuItems.push({
          label: 'GitHub',
          submenu: [
            {
              label: 'Home',
              click: () => shell.openExternal(githubUrl)
            },
            {
              label: 'Branches',
              click: () => shell.openExternal(`${githubUrl}/branches`)
            },
            {
              label: 'Issues',
              click: () => shell.openExternal(`${githubUrl}/issues`)
            },
            {
              label: 'Pull requests',
              click: () => shell.openExternal(`${githubUrl}/pulls`)
            }
          ]
        })
      }

      remote.Menu.buildFromTemplate(menuItems).popup()
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

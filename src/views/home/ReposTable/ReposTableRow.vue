<template>
  <tr>
    <td>
      <path-name :repo="repo" />
    </td>
    <td>
      <local-branch-list :repo="repo" @change="refresh" />
    </td>
    <td>
      <tracking-branch-list :repo="repo" />
    </td>
    <td>
      <command-list :repo="repo" />
    </td>
    <td>
      <fetch-log :repo="repo" :row-index="rowIndex" />
    </td>
  </tr>
</template>

<script lang="ts">
import { remote } from 'electron'
import Vue from 'vue'
import Git from '@/scripts/Git'
import watch from '@/scripts/watch'
import PathName from './ReposTableRowPathName.vue'
import LocalBranchList from './ReposTableRowLocalBranchList.vue'
import TrackingBranchList from './ReposTableRowTrackingBranchList.vue'
import CommandList from './ReposTableRowCommandList.vue'
import FetchLog from './ReposTableRowFetchLog.vue'

export default Vue.extend({
  components: {
    PathName,
    LocalBranchList,
    TrackingBranchList,
    CommandList,
    FetchLog
  },
  props: {
    repo: {
      type: Object as () => Git,
      required: true
    },
    rowIndex: {
      type: Number,
      required: true
    }
  },
  created() {
    const run = () => window.setTimeout(this.refresh, this.rowIndex * 50)

    run()
    window.addEventListener('focus', run)

    // ファイルが変更されたら更新
    const watcher = watch(this.repo.basePath, run)

    // Diffウィンドウからのイベント
    const evName = `change:${this.repo.basePath}`
    const onchange = (event: any, newLogText?: string) => {
      if (newLogText) {
        this.repo.setLogText(newLogText)
      }

      this.refresh()
    }

    remote.ipcMain.addListener(evName, onchange)

    this.$once('hook:beforeDestroy', () => {
      window.removeEventListener('focus', run)
      watcher.close()
      remote.ipcMain.removeListener(evName, onchange)
    })
  },
  methods: {
    refresh() {
      this.repo.status()
      this.repo.branch()
    }
  }
})
</script>

<template>
  <div class="wrap">
    <textarea
      v-model="commitMessage"
      class="j-input"
      placeholder="Commit Message"
    />
    <div class="buttons">
      <button class="block" :disabled="isBtnDisabled" @click="commit">
        Commit
      </button>
      <branch-menu :repo="repo" @change="updateParent" />
      <button class="block commands" @click="commandMenu">Commands</button>
      <button class="block" @click="closeWindow">Close</button>
    </div>
  </div>
</template>

<script lang="ts">
import { exec } from 'child_process'
import { remote } from 'electron'
import Vue from 'vue'
import Git from '@/scripts/Git'
import { showError } from '@/scripts/electronDialog'
import { Command } from '@/store'
import { CurrentFile } from '@/store/diff'
import BranchMenu from './CommitBranchMenu.vue'

export default Vue.extend({
  components: {
    BranchMenu
  },
  props: {
    repo: {
      type: Object as () => Git,
      required: true
    }
  },
  data() {
    return {
      commitMessage: ''
    }
  },
  computed: {
    commandList(): Command[] {
      return this.$store.state.commandList
    },
    currentFile(): CurrentFile {
      return this.$store.state.diff.currentFile
    },
    isBtnDisabled(): boolean {
      const { staged } = this.repo.statusResult
      return !staged || !staged.length || !this.commitMessage
    }
  },
  methods: {
    async commit() {
      try {
        await this.repo.commit(this.commitMessage)
        this.commitMessage = ''
        this.repo.status()
        this.updateParent()

        // コミット対象がDiff表示されていたらクリア
        if (this.currentFile.isCached) {
          this.$store.commit('diff/resetCurrent')
        }
      } catch (e) {
        showError(e.message)
      }
    },
    commandMenu() {
      const menuItems: Electron.MenuItemConstructorOptions[] = this.commandList.map(
        command => ({
          label: command.label,
          click: () => exec(command.commandLine, { cwd: this.repo.basePath })
        })
      )

      remote.Menu.buildFromTemplate(menuItems).popup()
    },
    closeWindow() {
      remote.getCurrentWindow().close()
    },
    updateParent(newLogText?: string) {
      // 親ウィンドウへイベント送信
      const parent = remote.getCurrentWindow().getParentWindow()
      parent.webContents.send(`change:${this.repo.basePath}`, newLogText)
    }
  }
})
</script>

<style lang="scss" scoped>
.wrap {
  display: flex;
}
.buttons {
  margin-left: 6px;
  width: 70px;

  button {
    line-height: 14px;
  }
}
.commands {
  padding-right: 0;
  padding-left: 0;
  letter-spacing: -0.5px;
}
.j-input {
  flex-grow: 1;
  box-sizing: border-box;
  height: 100%;
  resize: none;
}
</style>

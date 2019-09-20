<template>
  <div class="wrap">
    <div class="message">
      <textarea
        v-model="commitMessage"
        class="j-input"
        placeholder="Commit Message"
      />
      <label class="j-label">
        <input v-model="shouldCheckNum" type="checkbox" class="j-checkbox" />
        Should contain number of branch name
      </label>
    </div>

    <div class="buttons">
      <button class="block" :disabled="isBtnDisabled" @click="commit">
        Commit
      </button>
      <branch-menu :repo="repo" @change="updateMainWindow" />
      <button class="block commands" @click="commandMenu">Commands</button>
      <button class="block" @click="closeWindow">Close</button>
    </div>
  </div>
</template>

<script lang="ts">
import { exec } from 'child_process'
import { ipcRenderer, remote } from 'electron'
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
      commitMessage: '',
      shouldCheckNum: true
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
      const { files } = this.repo.statusResult

      return (
        !this.isMessageValid ||
        !files ||
        !files.length ||
        files.every(file => file.index === ' ' || file.index === '?')
      )
    },
    isMessageValid(): boolean {
      if (!this.commitMessage) return false
      if (!this.shouldCheckNum) return true

      const matchCurrent = /-(\d+)-/.exec(this.repo.statusResult.current) || []
      const matchMessage = /#(\d+) /.exec(this.commitMessage) || []

      return matchCurrent[1] === matchMessage[1]
    }
  },
  methods: {
    async commit() {
      try {
        await this.repo.commit(this.commitMessage)
        this.commitMessage = ''
        this.repo.status()
        this.updateMainWindow()

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
    updateMainWindow(newLogText?: string) {
      // メインウィンドウへイベント送信
      ipcRenderer.send(`change:${this.repo.basePath}`, newLogText)
    }
  }
})
</script>

<style lang="scss" scoped>
.wrap {
  display: flex;
}
.message {
  position: relative;
  flex-grow: 1;

  .j-input {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    resize: none;
  }

  .j-label {
    position: absolute;
    right: 0.3em;
    bottom: 0.1em;
    transition: opacity 0.1s;

    &:not(:hover) {
      opacity: 0.4;
    }
  }
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
</style>

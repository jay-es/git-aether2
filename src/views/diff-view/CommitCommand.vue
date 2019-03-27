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
      <branch-menu :repo="repo" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Git from '@/scripts/Git'
import { showError } from '@/scripts/electronDialog'
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

        // コミット対象がDiff表示されていたらクリア
        if (this.currentFile.isCached) {
          this.$store.commit('diff/resetCurrent')
        }
      } catch (e) {
        showError(e.message)
      }
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
  width: 60px;
}
.j-input {
  flex-grow: 1;
  box-sizing: border-box;
  height: 100%;
  resize: none;
}
</style>

<template>
  <dialog class="j-dialog" @click.self="backdrop" @keyup.enter="exec">
    <header class="j-dialog-header">
      <b>Merge</b> &ndash; {{ repo.basePath }}
    </header>

    <fieldset class="j-fieldset">
      <legend class="j-legend">Current Branch</legend>
      {{ branchName }}
    </fieldset>

    <fieldset class="j-fieldset">
      <legend class="j-legend">Branch To Merge</legend>
      <branch-list
        v-model="targetBranch"
        :repo="repo"
        :hidden-value="branchName"
      />
    </fieldset>

    <fieldset class="j-fieldset">
      <legend class="j-legend">Options</legend>
      <label class="j-label">
        <input
          v-model="shouldFetch"
          :disabled="isLocal"
          type="checkbox"
          class="j-checkbox"
        />
        Fetching Tracking Branch
      </label>
      <label class="j-label">
        <input v-model="ffOnly" type="checkbox" class="j-checkbox" />
        FF Only
      </label>
      <label class="j-label">
        <input v-model="noCommit" type="checkbox" class="j-checkbox" />
        No FF &amp; No Commit
      </label>
    </fieldset>

    <footer class="j-dialog-footer">
      <button @click="closeModal">Cancel</button>
      <button @click="exec">Merge</button>
    </footer>
  </dialog>
</template>

<script lang="ts">
import Git from '@/scripts/Git'
import ModalBase from './ModalBase'
import modalController from './modalController'
import BranchList from './BranchList.vue'

export default ModalBase.extend({
  components: {
    BranchList
  },
  data() {
    return {
      modalType: modalController.MERGE,
      branchName: '',
      repo: new Git(''),
      ffOnly: false,
      noCommit: false,
      shouldFetch: true,
      targetBranch: 'origin/master'
    }
  },
  computed: {
    isLocal(): boolean {
      return !this.targetBranch.includes('/')
    }
  },
  watch: {
    ffOnly(v) {
      if (v) this.noCommit = false
    },
    noCommit(v) {
      if (v) this.ffOnly = false
    }
  },
  methods: {
    init(repo: Git, branchName: string) {
      this.repo = repo
      this.branchName = branchName
      this.openModal()
    },
    async exec() {
      this.$el.classList.add('is-processing')

      try {
        // fetch
        if (this.shouldFetch && !this.isLocal) {
          const [remote, branch] = this.targetBranch.split('/')
          await this.repo.fetch(remote, branch)
        }

        // オプション配列
        const options = [this.targetBranch]
        if (this.ffOnly) options.push('--ff-only')
        if (this.noCommit) options.push('--no-ff', '--no-commit')

        const res = await this.repo.merge(options)
        this.repo.setLogText(res)
        this.closeModal()
      } catch (e) {
        alert(e.message)
      }

      this.$el.classList.remove('is-processing')
    },
    reset() {
      this.ffOnly = false
      this.noCommit = false
      this.shouldFetch = true
      this.targetBranch = 'origin/master'
    }
  }
})
</script>

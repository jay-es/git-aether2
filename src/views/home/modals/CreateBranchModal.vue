<template>
  <dialog class="j-dialog" @click.self="backdrop" @keyup.enter="exec">
    <header class="j-dialog-header">
      <b>Create Branch</b> &ndash; {{ repo.basePath }}
    </header>

    <fieldset class="j-fieldset">
      <legend class="j-legend">Branch Name</legend>
      <label class="j-label">
        <input
          v-model="isAutoNaming"
          type="radio"
          class="j-radio"
          :value="true"
        />
        Match Tracking Branch Name
      </label>
      <label class="j-label">
        <input
          v-model="isAutoNaming"
          type="radio"
          class="j-radio"
          :value="false"
        />
        Name:
        <input
          v-model="newBranchName"
          type="text"
          class="j-input"
          :disabled="isAutoNaming"
        />
      </label>
    </fieldset>

    <fieldset class="j-fieldset">
      <legend class="j-legend">Starting Revision</legend>
      <branch-list v-model="targetBranch" :repo="repo" />
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
    </fieldset>

    <footer class="j-dialog-footer">
      <span v-show="isAlreadyExists">
        A branch named '{{ newBranchName }}' already exists.
      </span>
      <button @click="closeModal">Cancel</button>
      <button :disabled="!canExec" @click="exec">Create</button>
    </footer>
  </dialog>
</template>

<script lang="ts">
import Git from '@/scripts/Git'
import { showError } from '@/scripts/electronDialog'
import ModalBase from './ModalBase'
import modalController from './modalController'
import BranchList from './BranchList.vue'

export default ModalBase.extend({
  components: {
    BranchList
  },
  data() {
    return {
      modalType: modalController.CREATE,
      branchName: '',
      repo: new Git(''),
      isAutoNaming: true,
      newBranchName: 'master',
      shouldFetch: true,
      targetBranch: 'origin/master'
    }
  },
  computed: {
    canExec(): boolean {
      return !!this.newBranchName && !this.isAlreadyExists
    },
    isAlreadyExists(): boolean {
      return this.repo.localBranchNames.some(v => v === this.newBranchName)
    },
    isLocal(): boolean {
      return !this.targetBranch.includes('/')
    }
  },
  watch: {
    isAutoNaming() {
      this.setBranchName()
    },
    targetBranch() {
      this.setBranchName()
    }
  },
  methods: {
    init(repo: Git) {
      this.repo = repo
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

        await this.repo.checkout(['-b', this.newBranchName, this.targetBranch])
        this.repo.branch()
        this.closeModal()
      } catch (e) {
        showError(e.message)
      }

      this.$el.classList.remove('is-processing')
    },
    reset() {
      this.isAutoNaming = true
      this.newBranchName = 'master'
      this.shouldFetch = true
      this.targetBranch = 'origin/master'
    },
    setBranchName() {
      if (!this.isAutoNaming) {
        return
      }

      this.newBranchName = this.isLocal
        ? this.targetBranch
        : this.targetBranch.split('/').pop() || ''
    }
  }
})
</script>

<style lang="scss" scoped>
.j-input {
  width: 25em;
}
</style>

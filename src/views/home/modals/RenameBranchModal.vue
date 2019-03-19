<template>
  <dialog
    class="j-dialog"
    @click.self="backdrop"
    @keyup.enter="canExec && exec()"
  >
    <header class="j-dialog-header">
      <b>Rename Branch</b> &ndash; {{ repo.basePath }}
    </header>

    <div class="input-group">
      <label>Branch:</label>
      {{ branchName }}
    </div>
    <div class="input-group">
      <label>New Name:</label>
      <input v-model="newName" type="text" class="j-input" />
    </div>

    <footer class="j-dialog-footer">
      <button @click="closeModal">Cancel</button>
      <button :disabled="!canExec" @click="exec">Rename</button>
    </footer>
  </dialog>
</template>

<script lang="ts">
import Git from '@/scripts/Git'
import ModalBase from './ModalBase'
import modalController from './modalController'

export default ModalBase.extend({
  data() {
    return {
      modalType: modalController.RENAME,
      branchName: '',
      repo: new Git(''),
      newName: ''
    }
  },
  computed: {
    canExec(): boolean {
      return !!this.newName
    }
  },
  methods: {
    init(repo: Git, branchName: string) {
      this.repo = repo
      this.branchName = branchName
      this.openModal()
    },
    async exec() {
      try {
        await this.repo.rename(this.branchName, this.newName)
        this.repo.branch()
        this.closeModal()
      } catch (e) {
        alert(e.message)
      }
    },
    reset() {
      this.newName = ''
    }
  }
})
</script>

<style lang="scss" scoped>
.input-group {
  margin-bottom: 0.5em;
}
label {
  display: inline-block;
  padding-right: 0.5em;
  width: 70px;
  text-align: right;
}
.j-input {
  width: 240px;
}
</style>

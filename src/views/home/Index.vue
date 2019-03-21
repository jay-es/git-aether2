<template>
  <div class="home">
    <nav>
      <router-link to="/command-list">CommandList</router-link> |
      <router-link to="/path-list">PathList</router-link>
    </nav>

    <repos-table />
    <diff-modal />
    <create-branch-modal />
    <merge-branch-modal />
    <rename-branch-modal />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import ReposTable from './ReposTable/ReposTable.vue'
import DiffModal from './modals/DiffModal.vue'
import CreateBranchModal from './modals/CreateBranchModal.vue'
import MergeBranchModal from './modals/MergeBranchModal.vue'
import RenameBranchModal from './modals/RenameBranchModal.vue'

export default Vue.extend({
  name: 'Index',
  components: {
    ReposTable,
    DiffModal,
    CreateBranchModal,
    MergeBranchModal,
    RenameBranchModal
  }
})
</script>

<style lang="scss" scoped>
nav {
  margin: -6px 0 6px;
}
</style>

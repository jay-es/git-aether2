<template>
  <button class="block" @click="popupMenu(currentBranch)">
    Branch
  </button>
</template>

<script lang="ts">
import BranchMenu, { branchInfo } from '@/components/BranchMenu'

export default BranchMenu.extend({
  computed: {
    currentBranch(): branchInfo {
      return Object.values(this.repo.branchSummary.branches || {}).find(
        v => v.current
      )
    }
  },
  data() {
    return {
      isCurrentOnly: true
    }
  }
})
</script>

<template>
  <button class="block" @click="popupMenu(currentBranch)">
    Branch
  </button>
</template>

<script lang="ts">
import BranchMenu, { BranchInfo } from '@/components/BranchMenu'

export default BranchMenu.extend({
  computed: {
    currentBranch(): BranchInfo | undefined {
      return Object.values(this.repo.branchSummary.branches || {}).find(
        v => !!v.current
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

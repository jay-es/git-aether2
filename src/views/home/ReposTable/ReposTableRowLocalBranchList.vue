<template>
  <ul class="cell j-list local-branch-list">
    <li
      v-for="(branch, i) in branches"
      :key="branch.name + i"
      :class="{ 'is-current': branch.current }"
      @click="checkout(branch.name)"
      @contextmenu="popupMenu(branch)"
    >
      {{ branch.name }}
    </li>
  </ul>
</template>

<script lang="ts">
import BranchMenu, { branchInfo } from '@/components/BranchMenu'

export default BranchMenu.extend({
  computed: {
    branches(): branchInfo[] {
      return Object.values(this.repo.branchSummary.branches || {}).filter(
        v => !v.name.startsWith('remotes/')
      )
    }
  }
})
</script>

<style lang="scss" scoped>
.local-branch-list {
  word-break: break-word;

  > li {
    &.is-current {
      color: var(--fontColor-deep);
      font-weight: 500;
      text-decoration: underline;
    }
    &:not(.is-current) {
      cursor: pointer;
    }
    &:hover {
      color: var(--fontColor-deep);
    }
  }
}
</style>

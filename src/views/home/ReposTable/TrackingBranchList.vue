<template>
  <ul class="cell j-list tracking-branch-list">
    <li v-for="branchName in branchNames" :key="branchName">
      {{ branchName }}
    </li>
  </ul>
</template>

<script lang="ts">
import Vue from 'vue'
import Git from '@/scripts/Git'

export default Vue.extend({
  props: {
    repo: {
      type: Object as () => Git,
      required: true
    }
  },
  computed: {
    branchNames(): string[] {
      return this.repo.trackingBranchNames
    }
  }
})
</script>

<style lang="scss" scoped>
.tracking-branch-list {
  word-break: break-word;
}
</style>

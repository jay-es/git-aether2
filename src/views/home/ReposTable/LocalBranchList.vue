<template>
  <ul class="cell j-list local-branch-list">
    <li
      v-for="branch in branches"
      :key="branch.name"
      :class="{ 'is-current': branch.current }"
      @click="checkout(branch.name)"
    >
      {{ branch.name }}
    </li>
  </ul>
</template>

<script lang="ts">
import Vue from 'vue'
import Git from '@/scripts/Git'

interface branchInfo {
  current: string // 実際はboolean
  name: string
  commit: string
  label: string
}

export default Vue.extend({
  props: {
    repo: {
      type: Object as () => Git,
      required: true
    }
  },
  computed: {
    branches(): branchInfo[] {
      return Object.values(this.repo.branchSummary.branches || {}).filter(
        v => !v.name.startsWith('remotes/')
      )
    }
  },
  methods: {
    async checkout(branchName: string) {
      // カレントブランチなら終了
      if (branchName === this.repo.branchSummary.current) return

      await this.repo.checkout(branchName)
      await this.repo.status()
      await this.repo.branch()
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

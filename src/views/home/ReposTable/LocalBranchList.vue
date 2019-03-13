<template>
  <ul class="cell j-list local-branch-list">
    <template v-for="(branch, key) in branches">
      <li
        :key="key"
        :class="{ 'is-current': branch.current }"
        @click="checkout(branch.name)"
      >
        {{ branch.name }}
      </li>
    </template>
  </ul>
</template>

<script lang="ts">
import Vue from 'vue'
import Git from '@/scripts/Git'

interface branchInfo {
  [key: string]: {
    current: string // 実際はboolean
    name: string
    commit: string
    label: string
  }
}

export default Vue.extend({
  props: {
    repo: {
      type: Object as () => Git,
      required: true
    }
  },
  data() {
    return {
      branches: {} as branchInfo
    }
  },
  created() {
    this.refresh()
    window.addEventListener('focus', this.refresh)
  },
  destroyed() {
    window.removeEventListener('focus', this.refresh)
  },
  methods: {
    async checkout(branchName: string) {
      await this.repo.checkout(branchName)
      this.refresh()
    },
    async refresh() {
      const branchSummary = await this.repo.branch()
      this.branches = branchSummary.branches
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

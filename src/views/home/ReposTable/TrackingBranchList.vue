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
  data() {
    return {
      branchNames: [] as string[]
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
    async refresh() {
      const branchSummary = await this.repo.branch(['--remote'])
      this.branchNames = branchSummary.all
    }
  }
})
</script>

<style lang="scss" scoped>
.tracking-branch-list {
  word-break: break-word;
}
</style>

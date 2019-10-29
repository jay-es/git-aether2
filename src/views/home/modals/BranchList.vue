<template>
  <div class="BranchList">
    <select v-model="targetBranch" class="j-select" :size="rowSize">
      <option
        v-for="branchName of localBranchNames"
        :key="branchName"
        :value="branchName"
      >
        {{ branchName }}
      </option>
    </select>
    <select
      v-for="(col, i) in trackingBranchCols"
      :key="i"
      v-model="targetBranch"
      class="j-select"
      :class="{ _last: i === trackingBranchCols.length - 1 }"
      :size="rowSize"
    >
      <option v-for="branchName of col" :key="branchName" :value="branchName">
        {{ branchName }}
      </option>
    </select>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Git from '@/scripts/Git'

export default Vue.extend({
  props: {
    repo: {
      type: Object as () => Git,
      required: true
    },
    hiddenValue: {
      type: String,
      default: ''
    },
    value: {
      type: String,
      required: true
    }
  },
  computed: {
    // select の行数
    rowSize(): number {
      const basis = 20
      const trackings = this.trackingBranchNames.length + 1 // 最終列に空白を作る

      // 3列
      if (trackings > basis * 2) {
        return Math.ceil(trackings / 3)
      }

      // 2列
      if (trackings > basis) {
        return Math.ceil(trackings / 2)
      }

      return Math.max(trackings, 5)
    },
    targetBranch: {
      get(): string {
        return this.value
      },
      set(v: string) {
        this.$emit('input', v)
      }
    },
    localBranchNames(): string[] {
      return this.repo.localBranchNames.filter(v => v !== this.hiddenValue)
    },
    trackingBranchNames(): string[] {
      return this.repo.trackingBranchNames.filter(v => v !== this.hiddenValue)
    },
    // trackingBranchNames を rowSize ごとに分割
    trackingBranchCols(): string[][] {
      const cols: string[][] = []

      this.trackingBranchNames.forEach((v, i) => {
        const index = Math.floor(i / this.rowSize)
        cols[index] = cols[index] || []
        cols[index].push(v)
      })

      return cols
    }
  }
})
</script>

<style lang="scss" scoped>
.BranchList {
  display: flex;
  max-width: 90vw;
  max-height: calc(100vh - 300px);
}
.j-select {
  margin: 0 0 0 -1px;
  flex-grow: 1;
  min-width: 6em;
  overflow: auto;

  &:first-child {
    border-radius: 3px 0 0 3px;
  }
  &._last {
    border-radius: 0 3px 3px 0;
  }
}
</style>

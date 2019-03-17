<template>
  <ul class="cell j-list local-branch-list">
    <li
      v-for="(branch, i) in branches"
      :key="branch.name"
      v-jcontextmenu="i"
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

      try {
        await this.repo.checkout(branchName)
        this.$emit('update')
      } catch (e) {
        alert(e.message.replace(/\t/g, '    '))
      }
    },
    jContextMenuItems(index: number) {
      const branch: branchInfo = this.branches[index]
      return [
        // カレントブランチ
        {
          label: `Push (origin/${branch.name})`,
          enabled: branch.current,
          click: () => {
            console.log('TODO: Push')
          }
        },
        {
          label: `Pull (origin/${branch.name})`,
          enabled: branch.current,
          click: () => {
            console.log('TODO: Pull')
          }
        },
        {
          label: 'Merge',
          enabled: branch.current,
          click: () => {
            console.log('TODO: Merge')
          }
        },
        { type: 'separator' },

        // カレントブランチではない
        {
          label: 'Checkout',
          enabled: !branch.current,
          click: () => this.checkout(branch.name)
        },
        {
          label: 'Delete',
          enabled: !branch.current,
          click: () => {
            console.log('TODO: Delete')
          }
        },
        { type: 'separator' },

        // どちらでも
        {
          label: 'Rename',
          click: () => {
            console.log('TODO: Rename')
          }
        },
        {
          label: 'Create',
          click: () => {
            console.log('TODO: Create')
          }
        }
      ]
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

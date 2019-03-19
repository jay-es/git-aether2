<template>
  <ul class="cell j-list local-branch-list">
    <li
      v-for="(branch, i) in branches"
      :key="branch.name + i"
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
import modalController from '../modals/modalController'

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
        this.$emit('change')
      } catch (e) {
        alert(e.message.replace(/\t/g, '    '))
      }
    },
    async delete(branchName: string, force?: boolean): Promise<void> {
      const confirmText = force
        ? `The branch '${branchName}' is not fully merged.\n` +
          'Recovering deleted branches is difficult.\nDelete this branch?'
        : 'Delete this branch?'

      if (!confirm(confirmText)) return

      try {
        await this.repo.delete(branchName, force)
        this.$emit('change')
      } catch (e) {
        // マージされていないブランチだったら、強制削除モードで再度実行
        if (e.message.includes('is not fully merged.')) {
          return await this.delete(branchName, true)
        }

        alert(e.message)
      }
    },
    async pull(remote: string, branch: string) {
      this.toggleAnimation(true)

      try {
        const res = await this.repo.pull(remote, branch)
        const newLogText = Object.entries(res.summary)
          .map(([k, v]) => `${k}: ${v}`)
          .join('\n')

        this.repo.setLogText(newLogText)
        this.$emit('change')
      } catch (e) {
        alert(e.message)
      }

      this.toggleAnimation(false)
    },
    async push(remote: string, branch: string) {
      this.toggleAnimation(true)

      try {
        await this.repo.push(remote, branch, { '-u': null })
        this.$emit('change')
      } catch (e) {
        alert(e.message)
      }

      this.toggleAnimation(false)
    },
    // is-processing クラスのつけはずし
    toggleAnimation(start: boolean) {
      if (this.$el.parentElement) {
        const method = start ? 'add' : 'remove'
        this.$el.parentElement.classList[method]('is-processing')
      }
    },

    // コンテキストメニュー
    async jContextMenuItems(index: number) {
      const branch: branchInfo = this.branches[index]
      const remoteName = 'origin' // (await this.repo.getRemoteName()).trim()
      const trackingBranchName = `${remoteName}/${branch.name}`
      const remoteBranchName = `remotes/${trackingBranchName}`
      const hasRemote = this.repo.branchSummary.all.includes(remoteBranchName)

      return [
        // カレントブランチ
        {
          label: `Push (${trackingBranchName})`,
          enabled: branch.current,
          click: () => this.push(remoteName, branch.name)
        },
        {
          label: `Pull (${trackingBranchName})`,
          enabled: branch.current && hasRemote,
          click: () => this.pull(remoteName, branch.name)
        },
        {
          label: 'Merge',
          enabled: branch.current,
          click: () => modalController.openMergeModal(this.repo, branch.name)
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
          click: () => this.delete(branch.name)
        },
        { type: 'separator' },

        // どちらでも
        {
          label: 'Rename',
          click: () => modalController.openRenameModal(this.repo, branch.name)
        },
        {
          label: 'Create',
          click: () => modalController.openCreateModal(this.repo)
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

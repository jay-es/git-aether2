import { remote } from 'electron'
import Vue from 'vue'
import Git from '@/scripts/Git'
import { confirmDialog, showError } from '@/scripts/electronDialog'
import modalController from '@/views/home/modals/modalController'

export interface branchInfo {
  current: boolean
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
  data() {
    return {
      isCurrentOnly: false
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
        showError(e.message.replace(/\t/g, '    '))
      }
    },
    async delete(branchName: string, force?: boolean): Promise<void> {
      const message = force
        ? `The branch '${branchName}' is not fully merged.\n` +
          'Recovering deleted branches is difficult.\nDelete this branch?'
        : 'Delete this branch?'

      if (!confirmDialog(message)) return

      try {
        await this.repo.delete(branchName, force)
        this.$emit('change')
      } catch (e) {
        // マージされていないブランチだったら、強制削除モードで再度実行
        if (e.message.includes('is not fully merged.')) {
          return await this.delete(branchName, true)
        }

        showError(e.message)
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
        showError(e.message)
      }

      this.toggleAnimation(false)
    },
    async push(remote: string, branch: string) {
      this.toggleAnimation(true)

      try {
        await this.repo.push(remote, branch, { '-u': null })
        this.$emit('change')
      } catch (e) {
        showError(e.message)
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
    async popupMenu(branch: branchInfo) {
      const remoteName = 'origin' // (await this.repo.getRemoteName()).trim()
      const trackingBranchName = `${remoteName}/${branch.name}`
      const remoteBranchName = `remotes/${trackingBranchName}`
      const hasRemote = this.repo.branchSummary.all.includes(remoteBranchName)

      let menuItems: Electron.MenuItemConstructorOptions[] = [
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

      if (this.isCurrentOnly) {
        menuItems = menuItems.filter(v => v.enabled === branch.current)
      }

      remote.Menu.buildFromTemplate(menuItems).popup()
    }
  }
})

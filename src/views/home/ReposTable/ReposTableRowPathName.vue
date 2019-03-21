<template>
  <div class="cell">
    {{ repo.basePath }}<br />
    <p class="changes">
      <template v-if="changesNum">
        <a @click="openDiff">{{ changesText }}</a>
      </template>
      <template v-else>
        {{ changesText }}
      </template>
    </p>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Git from '@/scripts/Git'
import modalController from '../modals/modalController'

export default Vue.extend({
  props: {
    repo: {
      type: Object as () => Git,
      required: true
    }
  },
  computed: {
    changesNum(): number {
      const { files } = this.repo.statusResult
      return files ? files.length : 0
    },
    changesText(): string {
      if (this.changesNum === 0) return 'no changes'
      if (this.changesNum === 1) return '1 change'
      return `${this.changesNum} changes`
    }
  },
  methods: {
    openDiff() {
      modalController.openDiffModal(this.repo)
    }
  }
})
</script>

<style lang="scss" scoped>
.changes {
  display: inline-block;
  margin: 0.5em 0 0;
}
</style>

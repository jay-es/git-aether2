<template>
  <div class="cell">
    {{ repo.basePath }}<br />
    <p class="changes">
      <template v-if="changesNum">
        <a>{{ changesText }}</a>
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

export default Vue.extend({
  props: {
    repo: {
      type: Object as () => Git,
      required: true
    }
  },
  data() {
    return {
      changesNum: 0
    }
  },
  computed: {
    changesText(): string {
      if (this.changesNum === 0) return 'no changes'
      if (this.changesNum === 1) return '1 change'
      return `${this.changesNum} changes`
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
      const res = await this.repo.status()
      this.changesNum = res.files.length
    }
  }
})
</script>

<style lang="scss" scoped>
.changes {
  display: inline-block;
  margin-bottom: 0;
}
</style>

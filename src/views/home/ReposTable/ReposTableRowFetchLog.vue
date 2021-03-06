<template>
  <pre class="cell fetch-log" :class="{ 'is-processing': isFetching }">{{
    logText
  }}</pre>
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
    rowIndex: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      isFetching: false
    }
  },
  computed: {
    logText(): string {
      return this.repo.logText
    }
  },
  created() {
    const run = () => window.setTimeout(this.fetch, this.rowIndex * 600)
    const timerId = window.setInterval(run, 5 * 60000)

    if (process.env.NODE_ENV === 'production') {
      window.setTimeout(run, 1000)
    }

    this.$once('hook:beforeDestroy', () => {
      window.clearInterval(timerId)
    })

    this.$parent.$on('fetchAllPrune', this.fetch)
  },
  methods: {
    async fetch() {
      this.repo.setLogText('')
      this.isFetching = true

      try {
        const res = await this.repo.fetch({ '--all': null, '--prune': null })
        this.repo.setLogText(res.raw)
      } catch (e) {
        this.repo.setLogText(e.message)
      }

      this.isFetching = false
    }
  }
})
</script>

<style lang="scss" scoped>
.fetch-log {
  min-width: 12em;
}
</style>

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
    logText: {
      type: String,
      required: true
    },
    rowIndex: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      isFetching: false,
      timerId: 0
    }
  },
  created() {
    const run = () => window.setTimeout(this.fetch, this.rowIndex * 800)
    run()
    this.timerId = window.setInterval(run, 5 * 60000)
  },
  destroyed() {
    window.clearInterval(this.timerId)
  },
  methods: {
    async fetch() {
      this.$emit('update:logText', '')
      this.isFetching = true
      const res = await this.repo.fetch({ '--all': null, '--prune': null })
      this.$emit('update:logText', res.raw)
      this.isFetching = false
    }
  }
})
</script>

<style lang="scss" scoped>
.fetch-log {
  min-width: 12em;
  max-width: 33vw;
}
</style>

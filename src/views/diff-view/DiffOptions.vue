<template>
  <div>
    <section class="inline-block">
      <legend>Ignore Whitespace</legend>
      <label class="j-label block">
        <input v-model="ignoreWS" type="radio" class="j-radio" value="" />
        None
      </label>
      <label class="j-label block">
        <input v-model="ignoreWS" type="radio" class="j-radio" value="b" />
        Space Change
      </label>
      <label class="j-label block">
        <input v-model="ignoreWS" type="radio" class="j-radio" value="w" />
        All Space
      </label>
    </section>

    <section class="inline-block">
      <legend>Tab Size</legend>
      <label class="j-label block">
        <input v-model="tabSize" type="radio" class="j-radio" :value="2" />
        2
      </label>
      <label class="j-label block">
        <input v-model="tabSize" type="radio" class="j-radio" :value="4" />
        4
      </label>
      <label class="j-label block">
        <input v-model="tabSize" type="radio" class="j-radio" :value="8" />
        8
      </label>
    </section>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { DiffOptions } from '@/store/diff'

export default Vue.extend({
  computed: {
    diffOptions(): DiffOptions {
      return this.$store.state.diff.diffOptions
    },
    ignoreWS: {
      get(): string {
        return this.$store.state.diff.diffOptions.ignoreWhitespace
      },
      set(value: string) {
        this.$store.commit('diff/setOption', { key: 'ignoreWhitespace', value })
      }
    },
    tabSize: {
      get(): number {
        return this.$store.state.diff.diffOptions.tabSize
      },
      set(value: number) {
        this.$store.commit('diff/setOption', { key: 'tabSize', value })
      }
    }
  }
})
</script>

<style lang="scss" scoped>
.inline-block {
  vertical-align: top;

  &:nth-child(n + 2) {
    margin-left: 0.75em;
  }
}
</style>

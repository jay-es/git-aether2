<template>
  <table>
    <tr v-for="(line, i) in diffLines" :key="i">
      <template v-if="line.type === 'header' || line.type === 'hunk'">
        <td class="simple-diff-col" :class="line.type" colspan="2">
          <code v-text="line.text" />
        </td>
      </template>
      <template v-else>
        <td class="simple-diff-col" :class="line.type">
          <code v-text="line.text.charAt(0)" />
        </td>
        <td class="simple-diff-col" :class="line.type">
          <code v-text="line.text.substr(1)" />
        </td>
      </template>
    </tr>
  </table>
</template>

<script lang="ts">
import Vue from 'vue'
import Git from '@/scripts/Git'
import { CurrentFile } from '@/store/diff'
import { DiffLine } from './DiffDisp.vue'

export default Vue.extend({
  props: {
    diffLines: {
      type: Array as () => DiffLine[],
      required: true
    },
    repo: {
      type: Object as () => Git,
      required: true
    }
  },
  computed: {
    currentFile(): CurrentFile {
      return this.$store.state.diff.currentFile
    }
  }
})
</script>

<style lang="scss" scoped>
.simple-diff-col {
  padding: 0 0.5em;
  white-space: pre;

  &.ins {
    background-color: var(--diff-bgColor-ins);
    color: var(--diff-fontColor-ins);
  }
  &.del {
    background-color: var(--diff-bgColor-del);
    color: var(--diff-fontColor-del);
  }
  &.hunk {
    background-color: var(--diff-bgColor-info);
    line-height: 1.6;
    opacity: 0.75;
  }

  // コード部分の1文字目（+/-/スペース）
  &:nth-last-child(2) {
    padding-right: 0;
    width: 1px;
    user-select: none;
    color: hsla(0, 0%, 50%, 0.75);
  }
  &:nth-child(2) {
    padding-left: 3px;
  }
}
</style>

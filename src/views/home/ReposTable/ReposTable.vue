<template>
  <table class="j-table repos-table">
    <thead>
      <th>Path</th>
      <th>Local Branches</th>
      <th>Remote-Tracking Branches</th>
      <th>Commands</th>
      <th>Log</th>
    </thead>
    <tbody :data-rows="directories.length">
      <repos-table-row
        v-for="(directory, rowIndex) of directories"
        :key="directory"
        :directory="directory"
        :row-index="rowIndex"
      />
    </tbody>
  </table>
</template>

<script lang="ts">
import Vue from 'vue'
import { Path } from '@/store'
import ReposTableRow from './ReposTableRow.vue'

export default Vue.extend({
  components: {
    ReposTableRow
  },
  computed: {
    directories(): string[] {
      const pathList: Path[] = this.$store.state.pathList
      return pathList.map(v => v.directory)
    }
  }
})
</script>

<style lang="scss">
.repos-table {
  td {
    padding: 0;
  }

  .cell {
    padding: 4px 8px;
    margin: 0;
    overflow-y: auto;
    box-sizing: border-box;
    min-height: 4em;
  }

  @for $i from 1 through 20 {
    [data-rows='#{$i}'] .cell {
      height: calc(((100vh - 54px) / #{$i}) - 1px);
    }
  }
}
</style>

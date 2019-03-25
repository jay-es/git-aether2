<template>
  <table class="j-table repos-table">
    <thead>
      <th>Path</th>
      <th>Local Branches</th>
      <th>Remote-Tracking Branches</th>
      <th>Commands</th>
      <th>Log</th>
    </thead>
    <tbody :data-rows="repositories.length">
      <repos-table-row
        v-for="(repo, rowIndex) of repositories"
        :key="rowIndex"
        :repo="repo"
        :row-index="rowIndex"
      />
    </tbody>
  </table>
</template>

<script lang="ts">
import Vue from 'vue'
import Git from '@/scripts/Git'
import { Path } from '@/store'
import ReposTableRow from './ReposTableRow.vue'

export default Vue.extend({
  components: {
    ReposTableRow
  },
  data() {
    return {
      repositories: [] as Git[]
    }
  },
  async created() {
    const pathList: Path[] = this.$store.state.pathList

    // リポジトリの配列を作成、エラーがあったら除外
    const repos = pathList.map(v => new Git(v.directory))
    const errors = await Promise.all(repos.map(async repo => await repo.init()))
    this.repositories = repos.filter((v, i) => !errors[i])
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

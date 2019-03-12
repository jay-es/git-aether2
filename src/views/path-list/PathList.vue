<template>
  <div class="pathList">
    <table class="j-table">
      <thead>
        <th>Directory</th>
        <th>GitHub URL</th>
        <th></th>
      </thead>
      <tbody>
        <path-list-row
          v-for="(v, i) of pathList"
          :key="i"
          :list="pathList"
          :row-index="i"
          :row-item="v"
        ></path-list-row>
      </tbody>
    </table>

    <footer>
      <button :disabled="pathList.length >= MAX_ROWS" @click="addRow">
        Add row
      </button>
      <button @click="goBack">Cancel</button>
      <button @click="save">Save</button>
    </footer>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Path } from '@/store'
import PathListRow from './PathListRow.vue'

const emptyData: Path = {
  directory: '',
  github: ''
}

export default Vue.extend({
  name: 'PathList',
  components: {
    PathListRow
  },
  data() {
    const MAX_ROWS = 20
    const pathList: Path[] = this.$store.state.pathList.slice()

    for (let i = 0; i < 3; i++) {
      if (pathList.length >= MAX_ROWS) break
      pathList.push(Object.assign({}, emptyData))
    }

    return { MAX_ROWS, pathList }
  },
  methods: {
    addRow() {
      this.pathList.push(Object.assign({}, emptyData))
    },
    goBack() {
      this.$router.go(-1)
    },
    save() {
      const notEmpty = this.pathList.filter(v => v.directory)
      this.$store.commit('setPathList', notEmpty)
      this.goBack()
    }
  }
})
</script>

<style lang="scss" scoped>
.j-table {
  text-align: center;
}

footer {
  margin-top: 1em;
  text-align: right;
}
</style>

<template>
  <div class="CommandList">
    <table class="j-table">
      <thead>
        <th>Label</th>
        <th>Command Line</th>
        <th></th>
      </thead>
      <tbody>
        <command-list-row
          v-for="(v, i) of commandList"
          :key="i"
          :list="commandList"
          :row-index="i"
          :row-item="v"
        ></command-list-row>
      </tbody>
    </table>

    <footer>
      <button :disabled="commandList.length >= MAX_ROWS" @click="addRow">
        Add row
      </button>
      <button @click="goBack">Cancel</button>
      <button @click="save">Save</button>
    </footer>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Command } from '@/store'
import CommandListRow from './CommandListRow.vue'

const emptyData: Command = {
  commandLine: '',
  label: ''
}

export default Vue.extend({
  name: 'CommandList',
  components: {
    CommandListRow
  },
  data() {
    const MAX_ROWS = 20
    const commandList: Command[] = this.$store.state.commandList.slice()

    for (let i = 0; i < 3; i++) {
      if (commandList.length >= MAX_ROWS) break
      commandList.push(Object.assign({}, emptyData))
    }

    return { MAX_ROWS, commandList }
  },
  methods: {
    addRow() {
      this.commandList.push(Object.assign({}, emptyData))
    },
    goBack() {
      this.$router.go(-1)
    },
    save() {
      const notEmpty = this.commandList.filter(v => v.label)
      this.$store.commit('setCommandList', notEmpty)
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

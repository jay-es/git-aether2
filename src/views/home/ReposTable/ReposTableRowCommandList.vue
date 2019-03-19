<template>
  <ul class="cell j-list">
    <li v-for="({ label, commandLine }, i) of commandList" :key="i">
      <a href="#" :title="commandLine" @click="exec(commandLine)">
        {{ label }}
      </a>
    </li>
  </ul>
</template>

<script lang="ts">
import Vue from 'vue'
import Git from '@/scripts/Git'
import { Command } from '@/store'

/** OSのコマンドを実行 */
declare function exec(cwd: string, command: string): Promise<void>

export default Vue.extend({
  props: {
    repo: {
      type: Object as () => Git,
      required: true
    }
  },
  computed: {
    commandList(): Command[] {
      return this.$store.state.commandList
    }
  },
  methods: {
    exec(commandLine: string) {
      exec(this.repo.basePath, commandLine)
    }
  }
})
</script>

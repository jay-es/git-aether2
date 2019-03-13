<template>
  <ul class="cell j-list">
    <li v-for="(com, i) of commandList" :key="i">
      <a href="#" :title="com.commandLine" @click="exec(com.commandLine)">
        {{ com.label }}
      </a>
    </li>
  </ul>
</template>

<script lang="ts">
import Vue from 'vue'
import Git from '@/scripts/Git'
import { Command } from '@/store'

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
      this.repo.execCommand(commandLine)
    }
  }
})
</script>

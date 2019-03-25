<template>
  <tr>
    <td>
      <input
        v-model="rowItem.directory"
        type="text"
        class="j-input _directory"
        placeholder="c:/path/to/repository"
      /><br />
      {{ caution }}
    </td>
    <td>
      <label>https://github.com/</label>
      <input
        v-model="rowItem.github"
        type="text"
        class="j-input _github"
        placeholder="user/repository"
      />
    </td>
    <td>
      <button :disabled="isFirst" @click="move(rowIndex - 1)">↑</button>
      <button :disabled="isLast" @click="move(rowIndex)">↓</button>
      <button @click="remove">Remove</button>
    </td>
  </tr>
</template>

<script lang="ts">
import Vue from 'vue'
import Git from '@/scripts/Git'
import { Path } from '@/store'
import CommandListRow from '@/views/command-list/CommandListRow.vue'

export default Vue.extend({
  name: 'PathListRow',
  extends: CommandListRow,
  props: {
    list: {
      type: Array as () => Path[],
      required: true
    },
    rowItem: {
      type: Object as () => Path,
      required: true
    }
  },
  data() {
    return {
      caution: ''
    }
  },
  computed: {
    isEmpty(): boolean {
      return !this.rowItem.directory && !this.rowItem.github
    }
  },
  watch: {
    'rowItem.directory': {
      async handler(v) {
        this.caution = v ? await new Git(v).init() : ''
      },
      immediate: true
    }
  }
})
</script>

<style lang="scss" scoped>
td {
  padding: 0.75em 0;
}

label {
  margin-right: 0.5em;
  font-size: 12px;
  opacity: 0.75;
}

.j-input {
  &._directory {
    width: 18em;
  }
  &._github {
    width: 12em;
  }
}
</style>

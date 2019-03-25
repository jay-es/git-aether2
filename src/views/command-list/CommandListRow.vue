<template>
  <tr>
    <td>
      <input v-model="rowItem.label" type="text" class="j-input _label" />
    </td>
    <td>
      <input
        v-model="rowItem.commandLine"
        type="text"
        class="j-input _commandLine"
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
import { confirmDialog } from '@/scripts/electronDialog'
import Vue from 'vue'
import { Command } from '@/store'

export default Vue.extend({
  name: 'CommandListRow',
  props: {
    list: {
      type: Array as () => Command[],
      required: true
    },
    rowIndex: {
      type: Number,
      required: true
    },
    rowItem: {
      type: Object as () => Command,
      required: true
    }
  },
  computed: {
    isEmpty(): boolean {
      return !this.rowItem.label && !this.rowItem.commandLine
    },
    isFirst(): boolean {
      return this.rowIndex === 0
    },
    isLast(): boolean {
      return this.rowIndex === this.list.length - 1
    }
  },
  methods: {
    // ひとつ下と入れ替える（-1でひとつ上と入れ替える処理になる）
    move(i: number) {
      this.list.splice(i, 2, this.list[i + 1], this.list[i])
    },
    remove() {
      // データがない行だったら削除して終了
      if (this.isEmpty) {
        this.list.splice(this.rowIndex, 1)
        return
      }

      // データがあったら確認ダイアログ
      if (confirmDialog('Remove this row?')) {
        this.list.splice(this.rowIndex, 1)
      }
    }
  }
})
</script>

<style lang="scss" scoped>
td {
  padding: 0.75em 0;
}

.j-input {
  &._label {
    width: 10em;
  }
  &._commandLine {
    width: 30em;
  }
}
</style>

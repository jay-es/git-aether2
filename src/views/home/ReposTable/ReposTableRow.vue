<template>
  <tr>
    <td>
      <path-name :repo="repo" />
    </td>
    <td>
      <local-branch-list :repo="repo" />
    </td>
    <td>
      <tracking-branch-list :repo="repo" />
    </td>
    <td>
      <command-list :repo="repo" />
    </td>
    <td>
      <fetch-log :repo="repo" :row-index="rowIndex" :log-text.sync="logText" />
    </td>
  </tr>
</template>

<script lang="ts">
import Vue from 'vue'
import Git from '@/scripts/Git'
import PathName from './PathName.vue'
import LocalBranchList from './LocalBranchList.vue'
import TrackingBranchList from './TrackingBranchList.vue'
import CommandList from './CommandList.vue'
import FetchLog from './FetchLog.vue'

export default Vue.extend({
  components: {
    PathName,
    LocalBranchList,
    TrackingBranchList,
    CommandList,
    FetchLog
  },
  props: {
    repo: {
      type: Object as () => Git,
      required: true
    },
    rowIndex: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      logText: ''
    }
  }
})
</script>
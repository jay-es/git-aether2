<template>
  <ul v-show="show" :style="styleObject" class="jcm" @mousedown.left.stop>
    <template v-for="(item, i) in menuItems">
      <hr v-if="item.type === 'separator'" :key="i" class="jcm-separator" />

      <li v-else-if="!item.enabled" :key="i" class="jcm-item--off">
        {{ item.label }}
      </li>

      <li v-else :key="i" class="jcm-item--on" @click="onclick(item.click)">
        {{ item.label }}
      </li>
    </template>
  </ul>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    menuItems: {
      type: Array as () => any[],
      required: true
    },
    pageX: {
      type: Number,
      required: true
    },
    pageY: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      top: 0,
      left: 0,
      show: false
    }
  },
  computed: {
    styleObject(): { top: string; left: string } {
      return {
        top: `${this.top}px`,
        left: `${this.left}px`
      }
    }
  },
  watch: {
    menuItems() {
      this.top = this.pageY
      this.left = this.pageX
      this.show = true

      this.$nextTick(() => {
        const rects = this.$el.getClientRects()[0]

        // Bottom
        if (rects.bottom >= window.innerHeight) {
          this.top -= rects.height
        }

        // Right
        if (rects.right >= window.innerWidth) {
          this.left -= rects.width
        }
      })
    }
  },
  mounted() {
    window.addEventListener('blur', this.hide)
    window.addEventListener('mousedown', this.hide)
    window.addEventListener('scroll', this.hide)
  },
  destroyed() {
    window.removeEventListener('blur', this.hide)
    window.removeEventListener('mousedown', this.hide)
    window.removeEventListener('scroll', this.hide)
  },
  methods: {
    hide() {
      if (this.show) this.show = false
    },
    onclick(handler: () => void) {
      handler()
      this.hide()
    }
  }
})
</script>

<style>
.jcm {
  position: absolute;
  display: block;
  margin: 0;
  padding: 0.3em 0;
  border: 1px solid #bbb;
  background-color: #fff;
  list-style: none;
  cursor: default;
  font-size: 12px;
  color: #000;
  white-space: nowrap;
  user-select: none;
}
.jcm-item--on,
.jcm-item--off {
  padding: 0.3em 1.5em;
}
.jcm-item--on:hover {
  background-color: #eee;
}
.jcm-item--off {
  opacity: 0.4;
}
.jcm-separator {
  border: none;
  border-top: 1px solid #eee;
}
</style>

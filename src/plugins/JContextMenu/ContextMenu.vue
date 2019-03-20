<template>
  <dialog class="jcm" :style="styleObject" @mousedown.right="hide">
    <ul class="jcm-list">
      <template v-for="(item, i) in menuItems">
        <hr v-if="item.type === 'separator'" :key="i" class="jcm-separator" />

        <li
          v-else-if="!item.enabled"
          :key="i"
          class="jcm-item--off"
          @click.stop
        >
          {{ item.label }}
        </li>

        <li v-else :key="i" class="jcm-item--on" @click="onclick(item.click)">
          {{ item.label }}
        </li>
      </template>
    </ul>
  </dialog>
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
      left: 0
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
      ;(this.$el as HTMLDialogElement).showModal()
      this.top = this.pageY
      this.left = this.pageX

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
    window.addEventListener('click', this.hide)
    window.addEventListener('scroll', this.hide)
  },
  destroyed() {
    window.removeEventListener('blur', this.hide)
    window.removeEventListener('click', this.hide)
    window.removeEventListener('scroll', this.hide)
  },
  methods: {
    hide() {
      ;(this.$el as HTMLDialogElement).close()
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
  margin: 0;
  padding: 0;
  border: 1px solid #bbb;
  background-color: #fff;
  cursor: default;
  font-family: initial;
  font-size: 12px;
  color: #000;
  white-space: nowrap;
  user-select: none;
}
.jcm::backdrop {
  opacity: 0;
}
.jcm-list {
  display: block;
  margin: 0;
  padding: 0.3em 0;
  list-style: none;
}
.jcm-item--on,
.jcm-item--off {
  padding: 0.3em 1.5em;
}
.jcm-item--on:hover {
  background-color: #eee;
}
.jcm-item--off {
  color: #aaa;
}
.jcm-separator {
  border: none;
  border-top: 1px solid #eee;
}
</style>

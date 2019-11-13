import Vue from 'vue'
import modalController from './modalController'

export default Vue.extend({
  data() {
    return {
      modalType: ''
    }
  },
  created() {
    modalController.$on(this.modalType, this.init)
  },
  destroyed() {
    modalController.$off(this.modalType, this.init)
  },
  methods: {
    openModal() {
      const dialog = this.$el as HTMLDialogElement
      dialog.showModal()
      dialog.classList.add('fade')
    },
    closeModal() {
      const dialog = this.$el as HTMLDialogElement

      dialog.classList.remove('fade')
      setTimeout(() => {
        this.reset()
        dialog.close()
      }, 100)
    },
    backdrop(e: MouseEvent) {
      const BUFFER = 10
      const el = e.target as HTMLElement
      const top = e.offsetY < -BUFFER
      const left = e.offsetX < -BUFFER
      const bottom = e.offsetY > el.clientHeight + BUFFER
      const right = e.offsetX > el.clientWidth + BUFFER

      if (top || left || bottom || right) {
        this.closeModal()
      }
    },
    init() {},
    reset() {}
  }
})

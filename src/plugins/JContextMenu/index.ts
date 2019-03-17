import Vue from 'vue'
import ContextMenu from './ContextMenu.vue'

export default {
  install() {
    const vm = new Vue({
      data: {
        menuItems: [],
        pageX: 0,
        pageY: 0
      },
      render(h) {
        return h(ContextMenu, {
          props: {
            'menu-items': this.menuItems,
            'page-x': this.pageX,
            'page-y': this.pageY
          }
        })
      }
    }).$mount()
    document.body.appendChild(vm.$el)

    Vue.directive('jcontextmenu', {
      bind(el: HTMLElement, binding: any, vnode: any) {
        el.addEventListener('contextmenu', e => {
          e.preventDefault()

          // set default to enabled and click if undefined
          vm.menuItems = vnode.context.jContextMenuItems(binding.value)
          vm.menuItems = vm.menuItems.map(v =>
            Object.assign({ enabled: true, click() {} }, v)
          )

          vm.pageX = e.pageX
          vm.pageY = e.pageY
        })
      }
    })
  }
}

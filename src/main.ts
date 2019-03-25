import { remote } from 'electron'
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
;(win => {
  // ウィンドウ位置を復元
  const winPos = localStorage.getItem('winPos') || ''
  if (winPos) {
    const [x, y, w, h] = JSON.parse(winPos)
    win.setPosition(x, y)
    win.setSize(w, h)
  }

  // ウィンドウを表示
  win.show()

  // クローズ時にウィンドウ位置を保存
  window.addEventListener('beforeunload', () => {
    const data = [...win.getPosition(), ...win.getSize()]
    localStorage.setItem('winPos', JSON.stringify(data))
  })
})(remote.getCurrentWindow())

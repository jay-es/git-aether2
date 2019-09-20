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
  // メインウィンドウのみ
  if (window.location.hash !== '#/') return

  // ウィンドウ位置を復元
  const winPos = localStorage.getItem('winPos') || ''
  if (winPos) {
    win.setBounds(JSON.parse(winPos))
  }

  // ウィンドウを表示
  win.show()

  // クローズ時にウィンドウ位置を保存
  window.addEventListener('beforeunload', () => {
    localStorage.setItem('winPos', JSON.stringify(win.getBounds()))

    // 子ウィンドウをすべて閉じる
    remote.BrowserWindow.getAllWindows()
      .filter(w => w !== win)
      .forEach(w => w.close())
  })
})(remote.getCurrentWindow())

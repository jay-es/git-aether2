import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import JContextMenu from './plugins/JContextMenu'
import './global'

Vue.config.productionTip = false
Vue.use(JContextMenu)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

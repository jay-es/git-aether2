import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/home/Index.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/command-list',
      name: 'command-list',
      component: () =>
        import(/* webpackChunkName: "command-list" */ './views/command-list/CommandList.vue')
    },
    {
      path: '/path-list',
      name: 'path-list',
      component: () =>
        import(/* webpackChunkName: "path-list" */ './views/path-list/PathList.vue')
    },
    {
      path: '/diff-view',
      name: 'diff-view',
      component: () =>
        import(/* webpackChunkName: "diff-view" */ './views/diff-view/Index.vue')
    }
  ]
})

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
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ './views/About.vue')
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
    }
  ]
})

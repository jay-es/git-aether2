import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export interface Command {
  label: string
  commandLine: string
}

export interface Path {
  directory: string
  github: string
}

export type theme = 'theme-light' | 'theme-dark'

export interface RootState {
  commandList: Command[]
  pathList: Path[]
  theme: theme
}

const state: RootState = {
  commandList: JSON.parse(localStorage.commandList || '[]'),
  pathList: JSON.parse(localStorage.pathList || '[]'),
  theme: localStorage.theme || 'theme-light'
}

export default new Vuex.Store<RootState>({
  state,
  mutations: {
    setCommandList(state, payload: Command[]) {
      state.commandList = payload
      localStorage.setItem('commandList', JSON.stringify(payload))
    },
    setPathList(state, payload: Path[]) {
      state.pathList = payload
      localStorage.setItem('pathList', JSON.stringify(payload))
    }
  },
  actions: {}
})

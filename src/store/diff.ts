import { Module } from 'vuex'
import { RootState } from './index'

export interface CurrentFile {
  path: string
  isCached: boolean
  isUntracked: boolean
  timestamp: number
}

interface DiffState {
  currentFile: CurrentFile
}

const state: DiffState = {
  currentFile: {} as CurrentFile
}

const module: Module<DiffState, RootState> = {
  state,
  mutations: {
    resetCurrent(state) {
      state.currentFile = {} as CurrentFile
    },
    setCurrent(state, { file, isCached }) {
      state.currentFile = {
        isCached: isCached,
        isUntracked: file.index === '?',
        path: file.path,
        timestamp: Date.now()
      }
    },
    setCurrentCached(state, isCached) {
      state.currentFile.isCached = isCached
      state.currentFile.timestamp = Date.now()
    }
  },
  namespaced: true
}

export default module

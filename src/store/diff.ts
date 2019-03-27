import { Module } from 'vuex'
import { RootState } from './index'

export interface CurrentFile {
  path: string
  isCached: boolean
  isUntracked: boolean
  timestamp: number
}

export interface DiffOptions {
  ignoreWhitespace: string
  tabSize: number
}

interface DiffState {
  currentFile: CurrentFile
  diffOptions: DiffOptions
}

const state: DiffState = {
  currentFile: {} as CurrentFile,
  diffOptions: {
    ignoreWhitespace: '',
    tabSize: 4
  }
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
    setCurrentTimestamp(state) {
      state.currentFile.timestamp = Date.now()
    },
    setOption(state, { key, value }) {
      if (key === 'ignoreWhitespace') {
        state.diffOptions.ignoreWhitespace = value
      } else if (key === 'tabSize') {
        state.diffOptions.tabSize = value
      } else {
        throw new Error()
      }
    }
  },
  namespaced: true
}

export default module

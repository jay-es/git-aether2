import { Module } from 'vuex'
import { RootState } from './index'

export interface CurrentFile {
  path: string
  isNewFile: boolean
  isCached: boolean
  isUntracked: boolean
  timestamp: number
}

export interface DiffOptions {
  ignoreWhitespace: string
  isSplit: boolean
  tabSize: number
}

interface DiffState {
  currentFile: CurrentFile
  diffOptions: DiffOptions
}

const state: DiffState = {
  currentFile: {} as CurrentFile,
  diffOptions: localStorage.diffOptions
    ? JSON.parse(localStorage.diffOptions)
    : {
        ignoreWhitespace: '',
        isSplit: false,
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
        isCached,
        isNewFile: file.working_dir === '?' || file.working_dir === 'A',
        isUntracked: file.working_dir === '?',
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
      } else if (key === 'isSplit') {
        state.diffOptions.isSplit = value
      } else if (key === 'tabSize') {
        state.diffOptions.tabSize = value
      } else {
        throw new Error()
      }

      localStorage.setItem('diffOptions', JSON.stringify(state.diffOptions))
    }
  },
  namespaced: true
}

export default module

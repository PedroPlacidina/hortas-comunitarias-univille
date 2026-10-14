import canteiristasService from '@/services/canteiristas.service'

const state = {
  canteiristas: [],
  currentCanteirista: null,
  loading: false,
  error: null
}

const getters = {
  allCanteiristas: state => state.canteiristas,
  isLoading: state => state.loading
}

const mutations = {
  SET_CANTEIRISTAS(state, list) {
    state.canteiristas = list
  },
  SET_CURRENT_CANTEIRISTA(state, item) {
    state.currentCanteirista = item
  },
  ADD_CANTEIRISTA(state, item) {
    state.canteiristas.push(item)
  },
  UPDATE_CANTEIRISTA(state, updated) {
    const i = state.canteiristas.findIndex(c => c.id === updated.id)
    if (i !== -1) state.canteiristas.splice(i, 1, updated)
  },
  DELETE_CANTEIRISTA(state, id) {
    state.canteiristas = state.canteiristas.filter(c => c.id !== id)
  },
  SET_LOADING(state, loading) {
    state.loading = loading
  },
  SET_ERROR(state, error) {
    state.error = error
  }
}

const actions = {
  async fetchCanteiristas({ commit }) {
    commit('SET_LOADING', true)
    try {
      const res = await canteiristasService.getAll()
      commit('SET_CANTEIRISTAS', res.data)
      commit('SET_ERROR', null)
    } catch (err) {
      commit('SET_ERROR', err.message)
    } finally {
      commit('SET_LOADING', false)
    }
  },
  async fetchCanteirista({ commit }, id) {
    commit('SET_LOADING', true)
    try {
      const res = await canteiristasService.getById(id)
      commit('SET_CURRENT_CANTEIRISTA', res.data)
      commit('SET_ERROR', null)
      return res.data
    } catch (err) {
      commit('SET_ERROR', err.message)
      return null
    } finally {
      commit('SET_LOADING', false)
    }
  },
  async createCanteirista({ commit }, data) {
    try {
      const res = await canteiristasService.create(data)
      commit('ADD_CANTEIRISTA', res.data)
      return { success: true, data: res.data }
    } catch (err) {
      const data = err.response?.data
      const details = data?.details
      const message = details
        ? Object.values(details).join('; ')
        : (data?.error || 'Erro ao criar canteirista')
      return { success: false, message, details: details || null }
    }
  },
  async updateCanteirista({ commit }, { id, data }) {
    try {
      const res = await canteiristasService.update(id, data)
      commit('UPDATE_CANTEIRISTA', res.data)
      return { success: true, data: res.data }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.detail || 'Erro ao atualizar canteirista'
      }
    }
  },
  async deleteCanteirista({ commit }, id) {
    try {
      await canteiristasService.delete(id)
      commit('DELETE_CANTEIRISTA', id)
      return { success: true }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.detail || 'Erro ao deletar canteirista'
      }
    }
  }
}

export default { namespaced: true, state, getters, mutations, actions }

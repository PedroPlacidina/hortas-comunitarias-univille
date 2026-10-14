import api from './api'

export default {
  getAll(params = {}) {
    return api.get('/mensalidades-da-plataforma', { params })
  },

  getById(id) {
    return api.get(`/mensalidades-da-plataforma/${id}`)
  },

  update(id, data) {
    return api.put(`/mensalidades-da-plataforma/${id}`, data)
  }
}

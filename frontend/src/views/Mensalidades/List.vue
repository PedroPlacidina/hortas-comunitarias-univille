<template>
  <div class="mensalidades-list">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="mb-0">Mensalidades</h2>
      <div class="d-flex align-items-center gap-2">
        <label for="filtro-status" class="form-label mb-0">Status</label>
        <select id="filtro-status" v-model="filtroStatus" class="form-select">
          <option value="">Todas</option>
          <option value="paga">Pagas</option>
          <option value="pendente">Pendentes</option>
          <option value="atrasada">Atrasadas</option>
        </select>
      </div>
    </div>

    <div v-if="mensagemErro" class="alert alert-danger">{{ mensagemErro }}</div>

    <div v-if="isLoading" class="text-center my-4">
      <div class="spinner-border text-success" role="status"></div>
    </div>

    <div v-else-if="mensalidadesFiltradas.length === 0" class="text-muted text-center my-4">
      Nenhuma mensalidade encontrada.
    </div>

    <div v-else class="table-responsive">
      <table class="table table-hover align-middle">
        <thead class="table-light">
          <tr>
            <th>Usuário</th>
            <th>Plano</th>
            <th class="text-end">Valor</th>
            <th>Vencimento</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in mensalidadesFiltradas" :key="m.uuid">
            <td>{{ nomeUsuario(m.usuario_uuid) }}</td>
            <td>{{ nomePlano(m.plano_uuid) }}</td>
            <td class="text-end">{{ formatarValor(m.valor_em_centavos) }}</td>
            <td>{{ formatarData(m.data_vencimento) }}</td>
            <td>
              <span class="badge" :class="classeSituacao[situacao(m)]">
                {{ rotuloSituacao[situacao(m)] }}
              </span>
              <div v-if="m.data_pagamento" class="small text-muted">
                em {{ formatarData(m.data_pagamento) }}
              </div>
            </td>
            <td class="text-end">
              <button
                v-if="situacao(m) === 'pendente' || situacao(m) === 'atrasada'"
                class="btn btn-sm btn-outline-success"
                :disabled="salvando === m.uuid"
                @click="marcarComoPaga(m)"
              >
                {{ salvando === m.uuid ? 'Salvando...' : 'Marcar como paga' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import api from '@/services/api'
import { situacao } from '@/store/modules/mensalidades'

export default {
  name: 'MensalidadesList',
  setup() {
    const store = useStore()
    const filtroStatus = ref('')
    const salvando = ref(null)
    const erroAcao = ref('')
    const usuarios = ref({})
    const planos = ref({})

    const mensalidades = computed(() => store.getters['mensalidades/allMensalidades'])
    const isLoading = computed(() => store.getters['mensalidades/isLoading'])
    const mensagemErro = computed(() => erroAcao.value || store.state.mensalidades.error)

    const mensalidadesFiltradas = computed(() => {
      if (!filtroStatus.value) return mensalidades.value
      return mensalidades.value.filter(m => situacao(m) === filtroStatus.value)
    })

    const rotuloSituacao = { paga: 'Paga', pendente: 'Pendente', atrasada: 'Atrasada', cancelada: 'Cancelada' }
    const classeSituacao = { paga: 'bg-success', pendente: 'bg-warning text-dark', atrasada: 'bg-danger', cancelada: 'bg-secondary' }

    // A API de mensalidades devolve só os UUIDs; os nomes vêm de /usuarios e /planos
    const indexarPorUuid = lista => Object.fromEntries((lista || []).map(item => [item.uuid, item]))

    const carregarNomes = async () => {
      const [resUsuarios, resPlanos] = await Promise.allSettled([api.get('/usuarios'), api.get('/planos')])
      if (resUsuarios.status === 'fulfilled') usuarios.value = indexarPorUuid(resUsuarios.value.data)
      if (resPlanos.status === 'fulfilled') planos.value = indexarPorUuid(resPlanos.value.data)
    }

    const nomeUsuario = uuid => {
      const u = usuarios.value[uuid]
      return u ? (u.nome_completo || u.email) : '—'
    }
    const nomePlano = uuid => planos.value[uuid]?.nome || '—'

    const formatarValor = centavos =>
      (Number(centavos || 0) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

    // Datas chegam como YYYY-MM-DD; formatar sem new Date() evita deslocamento de fuso
    const formatarData = data => {
      if (!data) return '—'
      const [ano, mes, dia] = String(data).substring(0, 10).split('-')
      return `${dia}/${mes}/${ano}`
    }

    const marcarComoPaga = async m => {
      if (!confirm(`Marcar a mensalidade de ${nomeUsuario(m.usuario_uuid)} como paga hoje?`)) return
      erroAcao.value = ''
      salvando.value = m.uuid
      const result = await store.dispatch('mensalidades/marcarComoPaga', m.uuid)
      salvando.value = null
      if (!result.success) erroAcao.value = result.message
    }

    onMounted(() => {
      store.dispatch('mensalidades/fetchMensalidades')
      carregarNomes()
    })

    return {
      filtroStatus,
      salvando,
      isLoading,
      mensagemErro,
      mensalidadesFiltradas,
      rotuloSituacao,
      classeSituacao,
      situacao,
      nomeUsuario,
      nomePlano,
      formatarValor,
      formatarData,
      marcarComoPaga
    }
  }
}
</script>

<style scoped>
.mensalidades-list {
  padding: 20px;
}

#filtro-status {
  width: auto;
}
</style>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import Swal from 'sweetalert2'
import TeamForm from '@/components/TeamForm.vue'
import { equipeService } from '@/services/api.service'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

const isLoading = ref(true)
const profileData = ref<any>(null)

// Buscar dados do perfil
const fetchProfile = async () => {
  try {
    const token = authStore.token
    
    if (!token) {
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Você precisa estar autenticado para acessar esta página.',
        confirmButtonColor: '#198754'
      }).then(() => {
        router.push('/login')
      })
      return
    }

    const response = await equipeService.getMe()

    if (response.success) {
      profileData.value = response.data
    } else {
      throw new Error(response.message || 'Erro ao buscar perfil')
    }
  } catch (error: any) {
    console.error('Erro ao buscar perfil:', error)
    
    const errorMessage = error.response?.data?.message || 'Erro ao carregar dados do perfil. Por favor, tente novamente.'
    
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: errorMessage,
      confirmButtonColor: '#198754'
    }).then(() => {
      router.push('/')
    })
  } finally {
    isLoading.value = false
  }
}

// Enviar dados de edição
const handleSubmit = async (formData: FormData) => {
  try {
    const token = authStore.token
    
    if (!token) {
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Você precisa estar autenticado.',
        confirmButtonColor: '#198754'
      })
      return
    }

    // Adicionar o ID do usuário ao formData
    if (profileData.value?.id) {
      formData.append('id', String(profileData.value.id))
    }

    const response = await equipeService.edit(formData)

    if (response.success) {
      Swal.fire({
        icon: 'success',
        title: 'Sucesso!',
        text: 'Perfil atualizado com sucesso!',
        confirmButtonColor: '#198754'
      }).then(() => {
        router.push('/')
      })
    } else {
      // Tratar erros de validação
      let errorMessage = response.message || 'Erro ao atualizar perfil.'
      
      if (response.errors) {
        const errorsList = Object.entries(response.errors)
          .map(([field, messages]) => {
            const fieldMessages = Array.isArray(messages) ? messages : [messages]
            return fieldMessages.join(', ')
          })
          .join('\n')
        
        errorMessage = `${errorMessage}\n\n${errorsList}`
      }
      
      Swal.fire({
        icon: 'error',
        title: 'Erro de Validação',
        text: errorMessage,
        confirmButtonColor: '#198754'
      })
    }
  } catch (error: any) {
    console.error('Erro ao atualizar perfil:', error)
    
    const errorMessage = error.response?.data?.message || 'Erro ao atualizar perfil. Por favor, tente novamente.'
    let errorDetails = ''
    
    if (error.response?.data?.errors) {
      const errorsList = Object.entries(error.response.data.errors)
        .map(([field, messages]) => {
          const fieldMessages = Array.isArray(messages) ? messages : [messages]
          return fieldMessages.join(', ')
        })
        .join('\n')
      
      errorDetails = `\n\n${errorsList}`
    }
    
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: errorMessage + errorDetails,
      confirmButtonColor: '#198754'
    })
  }
}

const handleCancel = () => {
  router.push('/')
}

onMounted(() => {
  fetchProfile()
})
</script>

<template>
  <div class="team-edit py-5">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-lg-10">
          <div class="card shadow">
            <div class="card-header bg-success text-white">
              <h3 class="mb-0">{{ t('team.editTitle') }}</h3>
            </div>
            <div class="card-body p-4">
              <div v-if="isLoading" class="text-center py-5">
                <div class="spinner-border text-success" role="status">
                  <span class="visually-hidden">Carregando...</span>
                </div>
                <p class="mt-3">Carregando dados do perfil...</p>
              </div>
              
              <TeamForm 
                v-else-if="profileData"
                :initial-data="profileData"
                :is-edit-mode="true"
                @submit="handleSubmit"
                @cancel="handleCancel"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.team-edit {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.card {
  border: none;
  border-radius: 15px;
  overflow: hidden;
}

.card-header {
  padding: 1.5rem;
}
</style>


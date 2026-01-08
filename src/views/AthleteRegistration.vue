<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import AthleteForm from '@/components/AthleteForm.vue'
import { API_ENDPOINTS } from '@/config/api'

const { t } = useI18n()
const router = useRouter()

// Submit do formulário
const handleSubmit = (submitData: FormData) => {
  console.log('Dados do formulário:', Object.fromEntries(submitData))

  // Chamada para a API
  fetch(API_ENDPOINTS.registerAthlete, {
    method: 'POST',
    body: submitData
  })
    .then(response => response.json())
    .then(data => {
      console.log('Resposta da API:', data)
      
      // Verificar se a resposta foi bem-sucedida
      if (data.success === true) {
        Swal.fire({
          icon: 'success',
          title: 'Sucesso!',
          text: t('athlete.successMessage'),
          confirmButtonColor: '#198754'
        }).then(() => {
          // Redirecionar para a página inicial após fechar o modal
          router.push('/login')
        })
      } else {
        // Tratar erros de validação
        let errorMessage = data.message || 'Erro ao realizar cadastro.'
        
        // Se houver erros específicos de campos, formatá-los
        if (data.errors) {
          const errorsList = Object.entries(data.errors)
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
    })
    .catch(error => {
      console.error('Erro ao enviar cadastro:', error)
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Erro ao realizar cadastro. Por favor, tente novamente.',
        confirmButtonColor: '#198754'
      })
    })
}

const handleCancel = () => {
  router.push('/')
}
</script>

<template>
  <div class="athlete-registration py-5">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-lg-10">
          <div class="card shadow">
            <div class="card-header bg-success text-white">
              <h3 class="mb-0">{{ t('athlete.title') }}</h3>
            </div>
            <div class="card-body p-4">
              <AthleteForm 
                :is-edit-mode="false"
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
.athlete-registration {
  background-color: #f8f9fa;
  min-height: calc(100vh - 200px);
}

.card {
  border: none;
  border-radius: 10px;
}

.card-header {
  border-radius: 10px 10px 0 0 !important;
  padding: 1.5rem;
}

.form-label {
  font-weight: 500;
  color: #495057;
}

.text-danger {
  color: #dc3545;
}

h5 {
  color: #198754;
  font-weight: 600;
}

.gap-2 {
  gap: 0.5rem;
}
</style>

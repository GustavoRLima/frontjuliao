<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import TeamForm from '@/components/TeamForm.vue'
import { API_ENDPOINTS } from '@/config/api'

const { t } = useI18n()
const router = useRouter()


// Submit do formulário
const handleSubmit = (submitData: FormData) => {
  console.log('Dados do formulário:', Object.fromEntries(submitData))

  // Chamada para a API
  fetch(API_ENDPOINTS.registerTeam, {
    method: 'POST',
    body: submitData
  })
    .then(response => response.json())
    .then(data => {
      console.log('Resposta da API:', data)
      
      if (data.success === true) {
        Swal.fire({
          icon: 'success',
          title: 'Sucesso!',
          text: t('team.successMessage'),
          confirmButtonColor: '#198754'
        }).then(() => {
          router.push('/login')
        })
      } else {
        let errorMessage = data.message || 'Erro ao realizar cadastro.'
        
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
  <div class="team-registration py-5">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-lg-10">
          <div class="card shadow">
            <div class="card-header bg-success text-white">
              <h3 class="mb-0">{{ t('team.title') }}</h3>
            </div>
            <div class="card-body p-4">
              <TeamForm 
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
.team-registration {
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

.form-label {
  font-weight: 600;
  color: #495057;
}

.form-control,
.form-select {
  border-radius: 8px;
  border: 1px solid #ced4da;
  padding: 0.625rem 0.875rem;
}

.form-control:focus,
.form-select:focus {
  border-color: #198754;
  box-shadow: 0 0 0 0.2rem rgba(25, 135, 84, 0.25);
}

.btn {
  padding: 0.625rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
}

.text-danger {
  color: #dc3545;
}

h5 {
  color: #198754;
  font-weight: 600;
}

.img-thumbnail {
  border-radius: 8px;
}

@media (max-width: 768px) {
  .card-body {
    padding: 1.5rem !important;
  }
}
</style>


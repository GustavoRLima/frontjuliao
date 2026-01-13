<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import Swal from 'sweetalert2'

const { t } = useI18n()

interface TeamFormData {
  descricao: string
  email: string
  login: string
  senha: string
  confirmPassword: string
  cep: string
  rua: string
  numero: string
  bairro: string
  cidade: string
  estado: string
  pais: string
  ddi: string
  telefone: string
  professor: string
  faixa: string
}

interface Props {
  initialData?: Partial<TeamFormData>
  isEditMode?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isEditMode: false
})

const emit = defineEmits<{
  submit: [data: FormData]
  cancel: []
}>()

const formData = reactive<TeamFormData>({
  descricao: '',
  email: '',
  login: '',
  senha: '',
  confirmPassword: '',
  cep: '',
  rua: '',
  numero: '',
  bairro: '',
  cidade: '',
  estado: '',
  pais: 'Brasil',
  ddi: '+55',
  telefone: '',
  professor: '',
  faixa: ''
})

const documentFile = ref<File | null>(null)
const documentName = ref<string>('')

// Preencher dados iniciais se estiver em modo de edição
watch(() => props.initialData, (newData) => {
  if (newData && props.isEditMode) {
    Object.keys(newData).forEach((key) => {
      const typedKey = key as keyof TeamFormData
      if (formData.hasOwnProperty(typedKey) && newData[typedKey] !== undefined) {
        (formData as any)[typedKey] = newData[typedKey]
      }
    })
  }
}, { immediate: true })

// Formatação de telefone
const formatPhone = (event: Event) => {
  const input = event.target as HTMLInputElement
  let value = input.value.replace(/\D/g, '')

  if(formData.ddi === "+55") {
    if (value.length <= 11) {
      if (value.length <= 2) {
        value = value.replace(/^(\d{0,2})/, '($1')
      } else if (value.length <= 6) {
        value = value.replace(/^(\d{2})(\d{0,4})/, '($1) $2')
      } else if (value.length <= 10) {
        value = value.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
      } else {
        value = value.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3')
      }
    }
  }

  formData.telefone = value
}

// Formatação de CEP
const formatCep = (event: Event) => {
  const input = event.target as HTMLInputElement
  let value = input.value.replace(/\D/g, '')

  if (value.length <= 8) {
    value = value.replace(/^(\d{5})(\d{0,3})/, '$1-$2')
  }

  formData.cep = value
}

// Buscar endereço por CEP
const fetchAddressByCep = async () => {
  const cep = formData.cep.replace(/\D/g, '')

  if (cep.length !== 8) return

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
    const data = await response.json()

    if (!data.erro) {
      formData.rua = data.logradouro || ''
      formData.bairro = data.bairro || ''
      formData.cidade = data.localidade || ''
      formData.estado = data.uf || ''
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'CEP não encontrado',
        confirmButtonColor: '#198754'
      })
    }
  } catch (error) {
    console.error('Erro ao buscar CEP:', error)
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: 'Erro ao buscar CEP. Por favor, tente novamente.',
      confirmButtonColor: '#198754'
    })
  }
}

// Upload de documento
const handleDocumentUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (file) {
    documentFile.value = file
    documentName.value = file.name
  }
}

// Submit do formulário
const handleSubmit = () => {
  // Validar senha apenas se não estiver em modo de edição ou se senha foi preenchida
  if (!props.isEditMode || formData.senha) {
    if (formData.senha !== formData.confirmPassword) {
      Swal.fire({
        icon: 'warning',
        title: 'Atenção',
        text: t('team.passwordMismatch'),
        confirmButtonColor: '#198754'
      })
      return
    }
  }

  const submitData = new FormData()

  // Adicionar todos os campos do formulário
  Object.keys(formData).forEach((key) => {
    const value = formData[key as keyof typeof formData]
    if (value !== null && value !== undefined && key !== 'confirmPassword') {
      // No modo de edição, não enviar senha se estiver vazia
      if (props.isEditMode && key === 'senha' && !value) {
        return
      }
      submitData.append(key, String(value))
    }
  })

  // Adicionar arquivo (não obrigatório no modo de edição)
  if (documentFile.value) {
    submitData.append('documento_equipe', documentFile.value)
  }

  emit('submit', submitData)
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <!-- Informações Básicas -->
    <h5 class="border-bottom pb-2 mb-3">{{ t('team.basicInfo') }}</h5>

    <div class="row">
      <div class="col-md-6 mb-3">
        <label for="descricao" class="form-label">{{ t('team.name') }} <span
            class="text-danger">*</span></label>
        <input id="descricao" v-model="formData.descricao" type="text" class="form-control" required />
      </div>

      <div class="col-md-6 mb-3">
        <label for="email" class="form-label">{{ t('team.email') }} <span
            class="text-danger">*</span></label>
        <input id="email" v-model="formData.email" type="email" class="form-control" required />
      </div>

      <div class="col-md-2 mb-3">
        <label for="ddi" class="form-label">{{ t('team.ddi') }} <span
            class="text-danger">*</span></label>
        <input id="ddi" v-model="formData.ddi" type="text" class="form-control" maxlength="4" required />
      </div>

      <div class="col-md-4 mb-3">
        <label for="phone" class="form-label">{{ t('team.phone') }} <span
            class="text-danger">*</span></label>
        <input id="phone" v-model="formData.telefone" type="text" class="form-control" @input="formatPhone"
          placeholder="(00) 00000-0000" maxlength="15" required />
      </div>
    </div>

    <!-- Credenciais -->
    <h5 class="border-bottom pb-2 mb-3 mt-4">{{ t('team.credentials') }}</h5>

    <div class="row">
      <div class="col-md-4 mb-3">
        <label for="login" class="form-label">{{ t('team.login') }} <span
            class="text-danger">*</span></label>
        <input id="login" v-model="formData.login" type="text" class="form-control" required />
      </div>

      <div class="col-md-4 mb-3">
        <label for="password" class="form-label">{{ t('team.password') }} 
          <span v-if="!isEditMode" class="text-danger">*</span>
        </label>
        <input id="password" v-model="formData.senha" type="password" class="form-control" 
          :required="!isEditMode"
          :placeholder="isEditMode ? t('team.passwordOptional') : ''" />
        <small v-if="isEditMode" class="text-muted">{{ t('team.passwordEditHint') }}</small>
      </div>

      <div class="col-md-4 mb-3">
        <label for="confirmPassword" class="form-label">{{ t('team.confirmPassword') }} 
          <span v-if="!isEditMode" class="text-danger">*</span>
        </label>
        <input id="confirmPassword" v-model="formData.confirmPassword" type="password" class="form-control"
          :required="!isEditMode && !!formData.senha" />
      </div>
    </div>

    <!-- Endereço -->
    <h5 class="border-bottom pb-2 mb-3 mt-4">{{ t('team.address') }}</h5>

    <div class="row">
      <div class="col-md-3 mb-3">
        <label for="cep" class="form-label">{{ t('team.cep') }} <span
            class="text-danger">*</span></label>
        <input id="cep" v-model="formData.cep" type="text" class="form-control" @input="formatCep"
          @blur="fetchAddressByCep" placeholder="00000-000" maxlength="9" required />
      </div>

      <div class="col-md-7 mb-3">
        <label for="street" class="form-label">{{ t('team.street') }} <span
            class="text-danger">*</span></label>
        <input id="street" v-model="formData.rua" type="text" class="form-control" required />
      </div>

      <div class="col-md-2 mb-3">
        <label for="number" class="form-label">{{ t('team.number') }} <span
            class="text-danger">*</span></label>
        <input id="number" v-model="formData.numero" type="text" class="form-control" required />
      </div>
    </div>

    <div class="row">
      <div class="col-md-4 mb-3">
        <label for="neighborhood" class="form-label">{{ t('team.neighborhood') }} <span
            class="text-danger">*</span></label>
        <input id="neighborhood" v-model="formData.bairro" type="text" class="form-control" required />
      </div>

      <div class="col-md-4 mb-3">
        <label for="city" class="form-label">{{ t('team.city') }} <span
            class="text-danger">*</span></label>
        <input id="city" v-model="formData.cidade" type="text" class="form-control" required />
      </div>

      <div class="col-md-2 mb-3">
        <label for="state" class="form-label">{{ t('team.state') }} <span
            class="text-danger">*</span></label>
        <input id="state" v-model="formData.estado" type="text" class="form-control" maxlength="2"
          required />
      </div>

      <div class="col-md-2 mb-3">
        <label for="country" class="form-label">{{ t('team.country') }} <span
            class="text-danger">*</span></label>
        <input id="country" v-model="formData.pais" type="text" class="form-control" required />
      </div>
    </div>

    <!-- Faixa -->
    <h5 class="border-bottom pb-2 mb-3 mt-4">{{ t('team.professionalInfo') }}</h5>

    <div class="row">
      <div class="col-md-6 mb-3">
        <label for="professor" class="form-label">{{ t('team.professor') }} <span
            class="text-danger">*</span></label>
        <input id="professor" v-model="formData.professor" type="text" class="form-control" required />
      </div>

      <div class="col-md-6 mb-3">
        <label for="faixa" class="form-label">{{ t('team.faixa') }} <span
            class="text-danger">*</span></label>
        <select id="faixa" v-model="formData.faixa" class="form-select" required>
          <option value="">{{ t('team.selectFaixa') }}</option>
          <option value="branca">{{ t('team.faixa1') }}</option>
          <option value="cinza">{{ t('team.faixa2') }}</option>
          <option value="amarela">{{ t('team.faixa3') }}</option>
          <option value="laranja">{{ t('team.faixa4') }}</option>
          <option value="verde">{{ t('team.faixa5') }}</option>
          <option value="azul">{{ t('team.faixa6') }}</option>
          <option value="roxa">{{ t('team.faixa7') }}</option>
          <option value="marrom">{{ t('team.faixa8') }}</option>
          <option value="preta">{{ t('team.faixa9') }}</option>
        </select>
      </div>
    </div>

    <!-- Upload de Documento -->
    <h5 class="border-bottom pb-2 mb-3 mt-4">{{ t('team.documents') }}</h5>

    <div class="row">
      <div class="col-md-6 mb-3">
        <label for="document" class="form-label">{{ t('team.document') }} 
          <span v-if="!isEditMode" class="text-danger">*</span>
        </label>
        <input id="document" type="file" class="form-control" @change="handleDocumentUpload" 
          :required="!isEditMode" />
        <small class="text-muted">{{ t('team.documentHint') }}</small>
        <div v-if="documentName" class="mt-2">
          <span class="badge bg-success">{{ documentName }}</span>
        </div>
      </div>
    </div>

    <!-- Botões -->
    <div class="d-flex justify-content-end gap-2 mt-4">
      <button type="button" class="btn btn-secondary" @click="handleCancel">
        {{ t('team.cancel') }}
      </button>
      <button type="submit" class="btn btn-success">
        {{ isEditMode ? t('team.update') : t('team.submit') }}
      </button>
    </div>
  </form>
</template>

<style scoped>
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
</style>


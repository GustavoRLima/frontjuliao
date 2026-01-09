<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import Swal from 'sweetalert2'
import DynamicAutocomplete from './DynamicAutocomplete.vue'
import { API_ENDPOINTS } from '../config/api'

const { t } = useI18n()

interface Academy {
  id: number | string
  name: string
}

interface AthleteFormData {
  nome: string
  email: string
  tipo_doc: string
  documento: string
  login: string
  senha: string
  confirmPassword: string
  data_nascimento: string
  sexo: string
  ddi: string
  telefone: string
  cep: string
  rua: string
  numero: string
  bairro: string
  cidade: string
  estado: string
  pais: string
  tipo: string
  professor_nome: string
  faixa: string
  peso: string
  equipe_id: Academy | null
}

interface Props {
  initialData?: Partial<AthleteFormData>
  isEditMode?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isEditMode: false
})

const emit = defineEmits<{
  submit: [data: FormData]
  cancel: []
}>()

const formData = reactive<AthleteFormData>({
  nome: '',
  email: '',
  tipo_doc: '',
  documento: '',
  login: '',
  senha: '',
  confirmPassword: '',
  data_nascimento: '',
  sexo: '',
  ddi: "+55",
  telefone: '',
  cep: '',
  rua: '',
  numero: '',
  bairro: '',
  cidade: '',
  estado: '',
  pais: 'Brasil',
  tipo: '1',
  professor_nome: '',
  faixa: '',
  peso: '',
  equipe_id: null
})

const photoFile = ref<File | null>(null)
const photoPreview = ref<string>('')
const graduationDocFile = ref<File | null>(null)
const graduationDocName = ref<string>('')

// Preencher dados iniciais se estiver em modo de edição
watch(() => props.initialData, (newData) => {
  if (newData && props.isEditMode) {
    Object.keys(newData).forEach((key) => {
      const typedKey = key as keyof AthleteFormData
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

// Upload de foto
const handlePhotoUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (file) {
    photoFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      photoPreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

// Upload de documento de graduação
const handleGraduationDocUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (file) {
    graduationDocFile.value = file
    graduationDocName.value = file.name
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
        text: t('athlete.passwordMismatch'),
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
      
      if (key === 'equipe_id' && value && typeof value === 'object') {
        submitData.append('equipe_id', String(value.id))
      } else if (typeof value === 'string' || typeof value === 'number') {
        submitData.append(key, String(value))
      }
    }
  })

  // Adicionar arquivos (não obrigatórios no modo de edição)
  if (photoFile.value) {
    submitData.append('foto_3_4', photoFile.value)
  }
  if (graduationDocFile.value) {
    submitData.append('documento_graduacao', graduationDocFile.value)
  }

  emit('submit', submitData)
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <!-- Informações Pessoais -->
    <h5 class="border-bottom pb-2 mb-3">{{ t('athlete.personalInfo') }}</h5>

    <div class="row">
      <div class="col-md-6 mb-3">
        <label for="name" class="form-label">{{ t('athlete.name') }} <span
            class="text-danger">*</span></label>
        <input id="name" v-model="formData.nome" type="text" class="form-control" required />
      </div>

      <div class="col-md-6 mb-3">
        <label for="email" class="form-label">{{ t('athlete.email') }} <span
            class="text-danger">*</span></label>
        <input id="email" v-model="formData.email" type="email" class="form-control" required />
      </div>
    </div>

    <div class="row">
      <div class="col-md-4 mb-3">
        <label for="documentType" class="form-label">{{ t('athlete.documentType') }} <span
            class="text-danger">*</span></label>
        <select id="documentType" v-model="formData.tipo_doc" class="form-select" required>
          <option value="">{{ t('athlete.selectOption') }}</option>
          <option value="1">CPF</option>
          <option value="2">RG</option>
          <option value="3">{{ t('athlete.other') }}</option>
        </select>
      </div>

      <div class="col-md-4 mb-3">
        <label for="document" class="form-label">{{ t('athlete.document') }} <span
            class="text-danger">*</span></label>
        <input id="document" v-model="formData.documento" type="text" class="form-control" required />
      </div>

      <div class="col-md-4 mb-3">
        <label for="birthDate" class="form-label">{{ t('athlete.birthDate') }} <span
            class="text-danger">*</span></label>
        <input id="birthDate" v-model="formData.data_nascimento" type="date" class="form-control" required />
      </div>
    </div>

    <div class="row">
      <div class="col-md-6 mb-3">
        <label for="gender" class="form-label">{{ t('athlete.gender') }} <span
            class="text-danger">*</span></label>
        <select id="gender" v-model="formData.sexo" class="form-select" required>
          <option value="">{{ t('athlete.selectOption') }}</option>
          <option value="1">{{ t('athlete.male') }}</option>
          <option value="2">{{ t('athlete.female') }}</option>
        </select>
      </div>

      <div class="col-md-2 mb-3">
        <label for="ddi" class="form-label">DDI <span
            class="text-danger">*</span></label>
        <input id="ddi" v-model="formData.ddi" type="text" class="form-control" maxlength="4" required />
      </div>

      <div class="col-md-4 mb-3">
        <label for="phone" class="form-label">{{ t('athlete.phone') }} <span
            class="text-danger">*</span></label>
        <input id="phone" v-model="formData.telefone" type="text" class="form-control" @input="formatPhone"
          placeholder="(00) 00000-0000" maxlength="15" required />
      </div>
    </div>

    <!-- Credenciais -->
    <h5 class="border-bottom pb-2 mb-3 mt-4">{{ t('athlete.credentials') }}</h5>

    <div class="row">
      <div class="col-md-4 mb-3">
        <label for="login" class="form-label">{{ t('athlete.login') }} <span
            class="text-danger">*</span></label>
        <input id="login" v-model="formData.login" type="text" class="form-control" required />
      </div>

      <div class="col-md-4 mb-3">
        <label for="password" class="form-label">{{ t('athlete.password') }} 
          <span v-if="!isEditMode" class="text-danger">*</span>
        </label>
        <input id="password" v-model="formData.senha" type="password" class="form-control" 
          :required="!isEditMode" 
          :placeholder="isEditMode ? t('athlete.passwordOptional') : ''" />
        <small v-if="isEditMode" class="text-muted">{{ t('athlete.passwordEditHint') }}</small>
      </div>

      <div class="col-md-4 mb-3">
        <label for="confirmPassword" class="form-label">{{ t('athlete.confirmPassword') }} 
          <span v-if="!isEditMode" class="text-danger">*</span>
        </label>
        <input id="confirmPassword" v-model="formData.confirmPassword" type="password" class="form-control"
          :class="{ 'is-invalid': formData.confirmPassword && formData.senha !== formData.confirmPassword }"
          :required="!isEditMode && !!formData.senha" />
        <div v-if="formData.confirmPassword && formData.senha !== formData.confirmPassword"
          class="invalid-feedback">
          {{ t('athlete.passwordMismatch') }}
        </div>
      </div>
    </div>

    <!-- Endereço -->
    <h5 class="border-bottom pb-2 mb-3 mt-4">{{ t('athlete.address') }}</h5>

    <div class="row">
      <div class="col-md-3 mb-3">
        <label for="cep" class="form-label">{{ t('athlete.cep') }} <span
            class="text-danger">*</span></label>
        <input id="cep" v-model="formData.cep" type="text" class="form-control" @blur="fetchAddressByCep"
          @input="formatCep" placeholder="00000-000" maxlength="9" required />
      </div>

      <div class="col-md-7 mb-3">
        <label for="street" class="form-label">{{ t('athlete.street') }} <span
            class="text-danger">*</span></label>
        <input id="street" v-model="formData.rua" type="text" class="form-control" required />
      </div>

      <div class="col-md-2 mb-3">
        <label for="number" class="form-label">{{ t('athlete.number') }} <span
            class="text-danger">*</span></label>
        <input id="number" v-model="formData.numero" type="text" class="form-control" required />
      </div>
    </div>

    <div class="row">
      <div class="col-md-4 mb-3">
        <label for="neighborhood" class="form-label">{{ t('athlete.neighborhood') }} <span
            class="text-danger">*</span></label>
        <input id="neighborhood" v-model="formData.bairro" type="text" class="form-control"
          required />
      </div>

      <div class="col-md-4 mb-3">
        <label for="city" class="form-label">{{ t('athlete.city') }} <span
            class="text-danger">*</span></label>
        <input id="city" v-model="formData.cidade" type="text" class="form-control" required />
      </div>

      <div class="col-md-2 mb-3">
        <label for="state" class="form-label">{{ t('athlete.state') }} <span
            class="text-danger">*</span></label>
        <input id="state" v-model="formData.estado" type="text" class="form-control" maxlength="2"
          required />
      </div>

      <div class="col-md-2 mb-3">
        <label for="country" class="form-label">{{ t('athlete.country') }} <span
            class="text-danger">*</span></label>
        <input id="country" v-model="formData.pais" type="text" class="form-control" required />
      </div>
    </div>

    <!-- Tipo e Academia -->
    <h5 class="border-bottom pb-2 mb-3 mt-4">{{ t('athlete.professionalInfo') }}</h5>

    <div class="row">
      <div class="col-md-6 mb-3">
        <label for="type" class="form-label">{{ t('athlete.type') }} <span
            class="text-danger">*</span></label>
        <select id="type" v-model="formData.tipo" class="form-select" required>
          <option value="">{{ t('athlete.selectOption') }}</option>
          <option value="1">{{ t('athlete.student') }}</option>
          <option value="2">{{ t('athlete.teacher') }}</option>
        </select>
      </div>

      <div v-if="formData.tipo === '1'" class="col-md-6 mb-3">
        <label for="teacher" class="form-label">{{ t('athlete.teacherName') }} <span
            class="text-danger">*</span></label>
        <input id="teacher" v-model="formData.professor_nome" type="text" class="form-control"
          :required="formData.tipo === '1'" />
      </div>
    </div>

    <div class="row">
      <div class="col-6 mb-3">
        <DynamicAutocomplete :label="t('athlete.academy') + ' *'" :placeholder="t('athlete.searchAcademy')"
          :api-url="API_ENDPOINTS.getEquipes" v-model="formData.equipe_id" input-id="academy" />
      </div>

      <div class="col-md-3 mb-3">
        <label for="faixa" class="form-label">{{ t('athlete.faixa') }} <span
            class="text-danger">*</span></label>
        <select id="faixa" v-model="formData.faixa" class="form-select" required>
          <option value="">{{ t('athlete.selectFaixa') }}</option>
          <option value="branca">{{ t('athlete.faixa1') }}</option>
          <option value="cinza">{{ t('athlete.faixa2') }}</option>
          <option value="amarela">{{ t('athlete.faixa3') }}</option>
          <option value="laranja">{{ t('athlete.faixa4') }}</option>
          <option value="verde">{{ t('athlete.faixa5') }}</option>
          <option value="azul">{{ t('athlete.faixa6') }}</option>
          <option value="roxa">{{ t('athlete.faixa7') }}</option>
          <option value="marrom">{{ t('athlete.faixa8') }}</option>
          <option value="preta">{{ t('athlete.faixa9') }}</option>
        </select>
      </div>
      
      <div class="col-md-3 mb-3">
        <label for="peso" class="form-label">{{ t('athlete.peso') }} <span
            class="text-danger">*</span></label>
        <input id="peso" v-model="formData.peso" type="number" step="0.01" class="form-control"/>
      </div>
    </div>

    <!-- Upload de Arquivos -->
    <h5 class="border-bottom pb-2 mb-3 mt-4">{{ t('athlete.documents') }}</h5>

    <div class="row">
      <div class="col-md-6 mb-3">
        <label for="photo" class="form-label">{{ t('athlete.photo3x4') }} 
          <span v-if="!isEditMode" class="text-danger">*</span>
        </label>
        <input id="photo" type="file" class="form-control" accept="image/*" @change="handlePhotoUpload"
          :required="!isEditMode" />
        <small class="text-muted">{{ t('athlete.photoHint') }}</small>
        <div v-if="photoPreview" class="mt-2">
          <img :src="photoPreview" alt="Preview" class="img-thumbnail" style="max-width: 150px;" />
        </div>
      </div>

      <div class="col-md-6 mb-3">
        <label for="graduationDoc" class="form-label">{{ t('athlete.graduationDoc') }} 
          <span v-if="!isEditMode" class="text-danger">*</span>
        </label>
        <input id="graduationDoc" type="file" class="form-control" accept="image/*,application/pdf"
          @change="handleGraduationDocUpload" :required="!isEditMode && formData.faixa != 'branca'" />
        <small class="text-muted">{{ t('athlete.graduationDocHint') }}</small>
        <div v-if="graduationDocName" class="mt-2">
          <span class="badge bg-info">{{ graduationDocName }}</span>
        </div>
      </div>
    </div>

    <!-- Botões -->
    <div class="row mt-4">
      <div class="col-12 d-flex justify-content-end gap-2">
        <button type="button" class="btn btn-secondary" @click="handleCancel">
          {{ t('athlete.cancel') }}
        </button>
        <button type="submit" class="btn btn-success">
          {{ isEditMode ? t('athlete.update') : t('athlete.submit') }}
        </button>
      </div>
    </div>
  </form>
</template>

<style scoped>
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


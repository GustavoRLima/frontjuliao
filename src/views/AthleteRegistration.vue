<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import DynamicAutocomplete from '../components/DynamicAutocomplete.vue'

const { t } = useI18n()

interface Academy {
  id: number | string
  name: string
}

const formData = reactive({
  name: '',
  email: '',
  documentType: '',
  document: '',
  login: '',
  password: '',
  confirmPassword: '',
  birthDate: '',
  gender: '',
  phone: '',
  cep: '',
  street: '',
  number: '',
  neighborhood: '',
  city: '',
  state: '',
  country: 'Brasil',
  type: 'ALUNO',
  teacher: '',
  academy: null as Academy | null
})

const photoFile = ref<File | null>(null)
const photoPreview = ref<string>('')
const graduationDocFile = ref<File | null>(null)
const graduationDocName = ref<string>('')

// Formatação de telefone
const formatPhone = (event: Event) => {
  const input = event.target as HTMLInputElement
  let value = input.value.replace(/\D/g, '')

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

  formData.phone = value
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
      formData.street = data.logradouro || ''
      formData.neighborhood = data.bairro || ''
      formData.city = data.localidade || ''
      formData.state = data.uf || ''
    } else {
      alert('CEP não encontrado')
    }
  } catch (error) {
    console.error('Erro ao buscar CEP:', error)
    alert('Erro ao buscar CEP. Por favor, tente novamente.')
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
  if (formData.password !== formData.confirmPassword) {
    alert(t('athlete.passwordMismatch'))
    return
  }

  const submitData = new FormData()

  // Adicionar todos os campos do formulário
  Object.keys(formData).forEach((key) => {
    const value = formData[key as keyof typeof formData]
    if (value !== null && value !== undefined) {
      if (key === 'academy' && value && typeof value === 'object') {
        submitData.append('academy_id', String(value.id))
      } else if (typeof value === 'string') {
        submitData.append(key, value)
      }
    }
  })

  // Adicionar arquivos
  if (photoFile.value) {
    submitData.append('photo', photoFile.value)
  }
  if (graduationDocFile.value) {
    submitData.append('graduation_doc', graduationDocFile.value)
  }

  console.log('Dados do formulário:', Object.fromEntries(submitData))
  alert(t('athlete.successMessage'))

  // Aqui você faria a chamada para a API
  // fetch('http://juliao.localhost/api/register-athlete', {
  //   method: 'POST',
  //   body: submitData
  // })
}

// Resetar formulário
const resetForm = () => {
  Object.keys(formData).forEach((key) => {
    const typedKey = key as keyof typeof formData
    if (typeof formData[typedKey] === 'string') {
      (formData[typedKey] as string) = ''
    } else {
      formData[typedKey] = null as any
    }
  })
  formData.country = 'Brasil'
  photoFile.value = null
  photoPreview.value = ''
  graduationDocFile.value = null
  graduationDocName.value = ''
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
              <form @submit.prevent="handleSubmit">
                <!-- Informações Pessoais -->
                <h5 class="border-bottom pb-2 mb-3">{{ t('athlete.personalInfo') }}</h5>

                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="name" class="form-label">{{ t('athlete.name') }} <span
                        class="text-danger">*</span></label>
                    <input id="name" v-model="formData.name" type="text" class="form-control" required />
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
                    <select id="documentType" v-model="formData.documentType" class="form-select" required>
                      <option value="">{{ t('athlete.selectOption') }}</option>
                      <option value="CPF">CPF</option>
                      <option value="RG">RG</option>
                      <option value="OUTRO">{{ t('athlete.other') }}</option>
                    </select>
                  </div>

                  <div class="col-md-4 mb-3">
                    <label for="document" class="form-label">{{ t('athlete.document') }} <span
                        class="text-danger">*</span></label>
                    <input id="document" v-model="formData.document" type="text" class="form-control" required />
                  </div>

                  <div class="col-md-4 mb-3">
                    <label for="birthDate" class="form-label">{{ t('athlete.birthDate') }} <span
                        class="text-danger">*</span></label>
                    <input id="birthDate" v-model="formData.birthDate" type="date" class="form-control" required />
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="gender" class="form-label">{{ t('athlete.gender') }} <span
                        class="text-danger">*</span></label>
                    <select id="gender" v-model="formData.gender" class="form-select" required>
                      <option value="">{{ t('athlete.selectOption') }}</option>
                      <option value="M">{{ t('athlete.male') }}</option>
                      <option value="F">{{ t('athlete.female') }}</option>
                    </select>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="phone" class="form-label">{{ t('athlete.phone') }} <span
                        class="text-danger">*</span></label>
                    <input id="phone" v-model="formData.phone" type="text" class="form-control" @input="formatPhone"
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
                    <label for="password" class="form-label">{{ t('athlete.password') }} <span
                        class="text-danger">*</span></label>
                    <input id="password" v-model="formData.password" type="password" class="form-control" required />
                  </div>

                  <div class="col-md-4 mb-3">
                    <label for="confirmPassword" class="form-label">{{ t('athlete.confirmPassword') }} <span
                        class="text-danger">*</span></label>
                    <input id="confirmPassword" v-model="formData.confirmPassword" type="password" class="form-control"
                      :class="{ 'is-invalid': formData.confirmPassword && formData.password !== formData.confirmPassword }"
                      required />
                    <div v-if="formData.confirmPassword && formData.password !== formData.confirmPassword"
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
                    <input id="street" v-model="formData.street" type="text" class="form-control" required />
                  </div>

                  <div class="col-md-2 mb-3">
                    <label for="number" class="form-label">{{ t('athlete.number') }} <span
                        class="text-danger">*</span></label>
                    <input id="number" v-model="formData.number" type="text" class="form-control" required />
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-4 mb-3">
                    <label for="neighborhood" class="form-label">{{ t('athlete.neighborhood') }} <span
                        class="text-danger">*</span></label>
                    <input id="neighborhood" v-model="formData.neighborhood" type="text" class="form-control"
                      required />
                  </div>

                  <div class="col-md-4 mb-3">
                    <label for="city" class="form-label">{{ t('athlete.city') }} <span
                        class="text-danger">*</span></label>
                    <input id="city" v-model="formData.city" type="text" class="form-control" required />
                  </div>

                  <div class="col-md-2 mb-3">
                    <label for="state" class="form-label">{{ t('athlete.state') }} <span
                        class="text-danger">*</span></label>
                    <input id="state" v-model="formData.state" type="text" class="form-control" maxlength="2"
                      required />
                  </div>

                  <div class="col-md-2 mb-3">
                    <label for="country" class="form-label">{{ t('athlete.country') }} <span
                        class="text-danger">*</span></label>
                    <input id="country" v-model="formData.country" type="text" class="form-control" required />
                  </div>
                </div>

                <!-- Tipo e Academia -->
                <h5 class="border-bottom pb-2 mb-3 mt-4">{{ t('athlete.professionalInfo') }}</h5>

                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="type" class="form-label">{{ t('athlete.type') }} <span
                        class="text-danger">*</span></label>
                    <select id="type" v-model="formData.type" class="form-select" required>
                      <option value="">{{ t('athlete.selectOption') }}</option>
                      <option value="ALUNO">{{ t('athlete.student') }}</option>
                      <option value="PROFESSOR">{{ t('athlete.teacher') }}</option>
                    </select>
                  </div>

                  <div v-if="formData.type === 'ALUNO'" class="col-md-6 mb-3">
                    <label for="teacher" class="form-label">{{ t('athlete.teacherName') }} <span
                        class="text-danger">*</span></label>
                    <input id="teacher" v-model="formData.teacher" type="text" class="form-control"
                      :required="formData.type === 'ALUNO'" />
                  </div>
                </div>

                <div class="row">
                  <div class="col-12 mb-3">
                    <DynamicAutocomplete :label="t('athlete.academy') + ' *'" :placeholder="t('athlete.searchAcademy')"
                      api-url="http://juliao.localhost/api/get-equipes" v-model="formData.academy" input-id="academy" />
                  </div>
                </div>

                <!-- Upload de Arquivos -->
                <h5 class="border-bottom pb-2 mb-3 mt-4">{{ t('athlete.documents') }}</h5>

                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="photo" class="form-label">{{ t('athlete.photo3x4') }} <span
                        class="text-danger">*</span></label>
                    <input id="photo" type="file" class="form-control" accept="image/*" @change="handlePhotoUpload"
                      required />
                    <small class="text-muted">{{ t('athlete.photoHint') }}</small>
                    <div v-if="photoPreview" class="mt-2">
                      <img :src="photoPreview" alt="Preview" class="img-thumbnail" style="max-width: 150px;" />
                    </div>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="graduationDoc" class="form-label">{{ t('athlete.graduationDoc') }} <span
                        class="text-danger">*</span></label>
                    <input id="graduationDoc" type="file" class="form-control" accept="image/*,application/pdf"
                      @change="handleGraduationDocUpload" required />
                    <small class="text-muted">{{ t('athlete.graduationDocHint') }}</small>
                    <div v-if="graduationDocName" class="mt-2">
                      <span class="badge bg-info">{{ graduationDocName }}</span>
                    </div>
                  </div>
                </div>

                <!-- Botões -->
                <div class="row mt-4">
                  <div class="col-12 d-flex justify-content-end gap-2">
                    <button type="button" class="btn btn-secondary" @click="resetForm">
                      {{ t('athlete.cancel') }}
                    </button>
                    <button type="submit" class="btn btn-success">
                      {{ t('athlete.submit') }}
                    </button>
                  </div>
                </div>
              </form>
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

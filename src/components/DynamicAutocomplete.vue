<template>
  <div class="autocomplete-wrapper">
    <label v-if="label" :for="inputId" class="form-label">{{ label }}</label>
    <input
      :id="inputId"
      v-model="searchQuery"
      type="text"
      class="form-control"
      :placeholder="placeholder"
      @input="onInput"
      @focus="showDropdown = true"
      @blur="onBlur"
      autocomplete="off"
    />
    <ul v-if="showDropdown && filteredItems.length > 0" class="autocomplete-dropdown">
      <li
        v-for="item in filteredItems"
        :key="item.id"
        @mousedown.prevent="selectItem(item)"
        class="autocomplete-item"
      >
        {{ item.name }}
      </li>
    </ul>
    <div v-if="loading" class="spinner-border spinner-border-sm mt-2" role="status">
      <span class="visually-hidden">Carregando...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'

interface AutocompleteItem {
  id: number | string
  name: string
}

interface Props {
  label?: string
  placeholder?: string
  apiUrl: string
  modelValue?: AutocompleteItem | null
  inputId?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  placeholder: 'Digite para buscar...',
  inputId: 'autocomplete-input'
})

const emit = defineEmits<{
  'update:modelValue': [value: AutocompleteItem | null]
}>()

const searchQuery = ref('')
const items = ref<AutocompleteItem[]>([])
const showDropdown = ref(false)
const loading = ref(false)
let debounceTimeout: ReturnType<typeof setTimeout> | null = null

const filteredItems = computed(() => {
  if (!searchQuery.value) return items.value
  const query = searchQuery.value.toLowerCase()
  return items.value.filter(item => 
    item.name.toLowerCase().includes(query)
  )
})

watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    searchQuery.value = newValue.name
  } else {
    searchQuery.value = ''
  }
}, { immediate: true })

const fetchItems = async (query: string) => {
  loading.value = true
  try {
    const url = `${props.apiUrl}${query ? `?search=${encodeURIComponent(query)}` : ''}`
    const response = await fetch(url)
    const result = await response.json()
    
    // Adaptar a estrutura da resposta da API
    // A API retorna: { data: { equipes: [...] } }
    // Mapear 'descricao' para 'name'
    if (result.data && result.data.equipes) {
      items.value = result.data.equipes.map((item: any) => ({
        id: item.id,
        name: item.descricao
      }))
    } else {
      items.value = []
    }
  } catch (error) {
    console.error('Erro ao buscar itens:', error)
    items.value = []
  } finally {
    loading.value = false
  }
}

const onInput = () => {
  if (debounceTimeout) {
    clearTimeout(debounceTimeout)
  }
  
  debounceTimeout = setTimeout(() => {
    fetchItems(searchQuery.value)
  }, 300)
}

const selectItem = (item: AutocompleteItem) => {
  searchQuery.value = item.name
  emit('update:modelValue', item)
  showDropdown.value = false
}

const onBlur = () => {
  setTimeout(() => {
    showDropdown.value = false
  }, 200)
}

// Carregar itens inicialmente ao montar o componente
onMounted(() => {
  fetchItems('')
})
</script>

<style scoped>
.autocomplete-wrapper {
  position: relative;
}

.autocomplete-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
  background-color: white;
  border: 1px solid #ced4da;
  border-top: none;
  border-radius: 0 0 0.25rem 0.25rem;
  list-style: none;
  padding: 0;
  margin: 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.autocomplete-item {
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.autocomplete-item:hover {
  background-color: #f8f9fa;
}
</style>


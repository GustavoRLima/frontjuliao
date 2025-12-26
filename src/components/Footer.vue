<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <footer class="footer bg-black text-white py-4 mt-5">
    <div class="container-fluid px-4">
      <div class="row align-items-center">
        <div class="col-md-6 text-center text-md-start">
          <p class="mb-0">
            {{ t('footer.copyright') }}
          </p>
        </div>
        <div class="col-md-6 text-center text-md-end">
          <p class="mb-0">
            {{ t('footer.developed') }}
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  margin-top: auto;
  background-color: #000 !important;
  border-top: 3px solid #28a745;
}

.bg-black {
  background-color: #000 !important;
}

.footer p {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.9);
}

@media (max-width: 767px) {
  .footer .col-md-6 {
    margin-bottom: 1rem;
  }
  
  .footer .col-md-6:last-child {
    margin-bottom: 0;
  }
  
  .footer p {
    font-size: 0.85rem;
  }
}
</style>

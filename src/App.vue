<script setup lang="ts">
import NavBar from './components/NavBar.vue'
import Welcome from './views/Welcome.vue'
import Footer from './components/Footer.vue'
</script>

<template>
  <div id="app" class="d-flex flex-column min-vh-100">
    <NavBar />
    
    <main class="flex-grow-1">
      <Welcome />
    </main>
    
    <Footer />
  </div>
</template>

<style>
html, body {
  margin: 0;
  padding: 0;
}

#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.min-vh-100 {
  min-height: 100vh;
}

.flex-grow-1 {
  flex-grow: 1;
}

/* Aumentar largura dos containers */
.container {
  max-width: 1400px !important;
}

@media (min-width: 1400px) {
  .container {
    max-width: 1600px !important;
  }
}
</style>

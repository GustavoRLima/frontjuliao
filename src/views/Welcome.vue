<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// Carousel control
const carouselItems = [
  {
    id: 1,
    image: '/img/credencial1.jpeg',
    title: t('welcome.carousel1')
  },
  {
    id: 2,
    image: '/img/credencial2.jpeg',
    title: t('welcome.carousel2')
  },
  {
    id: 3,
    image: '/img/credencial3.jpeg',
    title: t('welcome.carousel3')
  }
]

  // Parceiros - adicione aqui os logos dos seus parceiros
  const partners = [
    { id: 1, name: 'FPJJI', logo: '/img/fpjji-parceiro.jpeg', url: 'https://www.fpjji.com' },
  // { id: 2, name: 'Parceiro 2', logo: '/img/parceiro2.png', url: 'https://www.parceiro2.com' },
  // { id: 3, name: 'Parceiro 3', logo: '/img/parceiro3.png', url: 'https://www.parceiro3.com' },
  // { id: 4, name: 'Parceiro 4', logo: '/img/parceiro4.png', url: 'https://www.parceiro4.com' },
  // { id: 5, name: 'Parceiro 5', logo: '/img/parceiro5.png', url: 'https://www.parceiro5.com' },
  // { id: 6, name: 'Parceiro 6', logo: '/img/parceiro6.png', url: 'https://www.parceiro6.com' },
  // { id: 7, name: 'Parceiro 7', logo: '/img/parceiro7.png', url: 'https://www.parceiro7.com' },
  // { id: 8, name: 'Parceiro 8', logo: '/img/parceiro8.png', url: 'https://www.parceiro8.com' }
]

// Agrupa os parceiros em grupos de 4 para o carrossel
const partnersGrouped = []
for (let i = 0; i < partners.length; i += 4) {
  partnersGrouped.push(partners.slice(i, i + 4))
}
</script>

<template>
  <div class="welcome-page">
    <!-- Banner Principal -->
    <section class="hero-banner">
      <div class="container px-4">
        <div class="row">
          <div class="col-12">
            <div class="banner-wrapper">
              <img 
                src="/img/logo-banner.png" 
                alt="Logo banner" 
                class="img-fluid w-100 banner-image rounded"
              >
              
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Seção de Cadastro -->
    <section class="bg-light py-5">
      <div class="container px-4">
        <h2 class="text-center mb-5 section-title">{{ t('welcome.register') }}</h2>
        <div class="row justify-content-center g-4">
          <div class="col-md-6 col-lg-5">
            <div class="registration-card">
              <img 
                src="/img/atleta1.png" 
                alt="Cadastro Atleta" 
                class="card-img-top"
              >
              <div class="card-body text-center">
                <h4 class="card-title">{{ t('welcome.athleteTitle') }}</h4>
                <p class="card-text"></p>
                <router-link to="/atleta" class="btn btn-success btn-lg">{{ t('welcome.registerButton') }}</router-link>
              </div>
            </div>
          </div>
          <div class="col-md-6 col-lg-5">
            <div class="registration-card">
              <img 
                src="/img/equipe1.png" 
                alt="Cadastro Equipe" 
                class="card-img-top"
              >
              <div class="card-body text-center">
                <h4 class="card-title">{{ t('welcome.teamTitle') }}</h4>
                <p class="card-text"></p>
                <router-link to="/equipe" class="btn btn-success btn-lg">{{ t('welcome.registerButton') }}</router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Seção de 3 Imagens com Textos -->
    <section class="features-section py-5 registration-section">
      <div class="container px-4">
        <!-- <h3 class="text-center section-title mb-5 text-white">{{ t('welcome.featuresTitle') }}</h3> -->
        <div class="row g-4">
          <div class="col-md-4">
            <div class="feature-card text-center">
              <a href="/pdf/Tabela_Pesos_Tempo_de_Luta_oficial.pdf" target="_blank" rel="noopener noreferrer">
                <img 
                  src="/img/tabela_pesos.png" 
                  alt="Recurso 1" 
                  class="img-fluid rounded mb-3 shadow feature-image"
                >
              </a>
              <h5 class="feature-title text-white">{{ t('welcome.feature1Title') }}</h5>
              <p class="feature-text text-white">
                {{ t('welcome.feature1Text') }}
              </p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="feature-card text-center">
              <a href="/pdf/CBJJI_OFICIAL_LIVRO-DE-REGRAS_atualizado.pdf" target="_blank" rel="noopener noreferrer">
                <img 
                  src="/img/livro_regras.png" 
                  alt="Recurso 2" 
                  class="img-fluid rounded mb-3 shadow feature-image"
                >
              </a>
              <h5 class="feature-title text-white">{{ t('welcome.feature2Title') }}</h5>
              <p class="feature-text text-white">
                {{ t('welcome.feature2Text') }}
              </p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="feature-card text-center">
              <a href="/pdf/Calendario-CBJJI-FBJJI-2025.pdf" target="_blank" rel="noopener noreferrer">
                <img 
                  src="/img/calendario_2025.png" 
                  alt="Recurso 3" 
                  class="img-fluid rounded mb-3 shadow feature-image"
                >
              </a>
              <h5 class="feature-title text-white">{{ t('welcome.feature3Title') }}</h5>
              <p class="feature-text text-white">
                {{ t('welcome.feature3Text') }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Seção com Texto e Carousel -->
    <section class="carousel-section py-5">
      <div class="container px-4">
        <div class="row mb-4">
          <div class="col-12">
            <h3 class="text-center section-title">{{ t('welcome.highlightsTitle') }}</h3>
            <!-- <p class="text-center lead px-3">
              {{ t('welcome.highlightsText') }}
            </p> -->
          </div>
        </div>
        
        <!-- Carousel Bootstrap -->
        <div class="row justify-content-center">
          <div class="col-12 col-lg-11 col-xl-10">
            <div id="highlightsCarousel" class="carousel slide" data-bs-ride="carousel">
              <div class="carousel-indicators">
                <button 
                  v-for="(item, index) in carouselItems" 
                  :key="item.id"
                  type="button" 
                  data-bs-target="#highlightsCarousel" 
                  :data-bs-slide-to="index"
                  :class="{ active: index === 0 }"
                  :aria-current="index === 0 ? 'true' : 'false'"
                  :aria-label="`Slide ${index + 1}`"
                ></button>
              </div>
              
              <div class="carousel-inner rounded shadow-lg">
                <div 
                  v-for="(item, index) in carouselItems" 
                  :key="item.id"
                  :class="['carousel-item', { active: index === 0 }]"
                >
                  <img :src="item.image" class="d-block w-100 carousel-image" :alt="item.title">
                  <!-- <div class="carousel-caption d-none d-md-block"> -->
                    <!-- <h5 class="fw-bold">{{ item.title }}</h5> -->
                  <!-- </div> -->
                </div>
              </div>

              
              
              <button class="carousel-control-prev" type="button" data-bs-target="#highlightsCarousel" data-bs-slide="prev">
                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Anterior</span>
              </button>
              <button class="carousel-control-next" type="button" data-bs-target="#highlightsCarousel" data-bs-slide="next">
                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Próximo</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Seção de Parceiros -->
    <section class="partners-section py-5">
      <div class="container px-4">
        <h2 class="text-center mb-5 section-title">{{ t('welcome.partnersTitle') }}</h2>
        
        <div class="row justify-content-center">
          <div class="col-12 col-lg-11 col-xl-10">
            <div id="partnersCarousel" class="carousel slide" data-bs-ride="carousel">
              <div class="carousel-indicators">
                <button 
                  v-for="(group, index) in partnersGrouped" 
                  :key="`indicator-${index}`"
                  type="button" 
                  data-bs-target="#partnersCarousel" 
                  :data-bs-slide-to="index"
                  :class="{ active: index === 0 }"
                  :aria-current="index === 0 ? 'true' : 'false'"
                  :aria-label="`Grupo ${index + 1}`"
                ></button>
              </div>
              
              <div class="carousel-inner">
                <div 
                  v-for="(group, groupIndex) in partnersGrouped" 
                  :key="`group-${groupIndex}`"
                  :class="['carousel-item', { active: groupIndex === 0 }]"
                >
                  <div class="row g-4 partners-grid">
                    <div 
                      v-for="partner in group" 
                      :key="partner.id"
                      class="col-6 col-md-3"
                    >
                      <a 
                        :href="partner.url" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        class="partner-card"
                      >
                        <div class="partner-logo-wrapper">
                          <img 
                            :src="partner.logo" 
                            :alt="partner.name"
                            class="partner-logo img-fluid"
                          >
                        </div>
                        <p class="partner-name text-center mt-3">{{ partner.name }}</p>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <button class="carousel-control-prev" type="button" data-bs-target="#partnersCarousel" data-bs-slide="prev">
                <span class="carousel-control-prev-icon partners-control" aria-hidden="true"></span>
                <span class="visually-hidden">Anterior</span>
              </button>
              <button class="carousel-control-next" type="button" data-bs-target="#partnersCarousel" data-bs-slide="next">
                <span class="carousel-control-next-icon partners-control" aria-hidden="true"></span>
                <span class="visually-hidden">Próximo</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.welcome-page {
  min-height: 100vh;
}

/* Hero Banner */
.hero-banner {
  padding: 2rem 0;
}

.banner-wrapper {
  position: relative;
  height: 500px;
  overflow: hidden;
  border-radius: 10px;
  width: 100%;
  max-width: 100%;
}

.banner-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6));
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
}

.banner-content {
  text-align: center;
  padding: 2rem;
  animation: fadeInUp 1s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Registration Section */
.registration-section {
  background: linear-gradient(135deg, #006517 0%, #127330 100%);
}

.section-title {
  font-weight: 700;
  font-size: 2.5rem;
  margin-bottom: 2rem;
}

.registration-card {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  height: 100%;
}

.registration-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
}

.registration-card img {
  width: 100%;
  height: 300px;
  object-fit: cover;
}

.registration-card .card-body {
  padding: 2rem;
}

.registration-card .card-title {
  color: #333;
  font-weight: 700;
  margin-bottom: 1rem;
  font-size: 1.75rem;
}

.registration-card .btn {
  padding: 0.75rem 2rem;
  font-weight: 600;
  font-size: 1.1rem;
  border-radius: 50px;
  transition: all 0.3s ease;
}

.registration-card .btn:hover {
  transform: scale(1.05);
  box-shadow: 0 5px 15px rgba(40, 167, 69, 0.4);
}

/* Features Section */
.features-section {
  padding: 4rem 0;
}

.feature-card {
  padding: 1.5rem;
  transition: transform 0.3s ease;
  height: 100%;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-card a {
  display: block;
  position: relative;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.feature-card a:hover {
  transform: scale(1.05);
}

.feature-card a:hover .feature-image {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
}

.feature-image {
  width: 100%;
  height: 300px;
  object-fit: cover;
  transition: all 0.3s ease;
}

.feature-title {
  font-weight: 700;
  color: #333;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.feature-text {
  color: #666;
  font-size: 1rem;
  line-height: 1.6;
}

/* Carousel Section */
.carousel-section {
  background-color: #f8f9fa;
}

.carousel-image {
  height: 500px;
  object-fit: cover;
}

.carousel-caption {
  background: rgba(0, 0, 0, 0.7);
  padding: 1.5rem;
  border-radius: 10px;
  bottom: 2rem;
}

.carousel-caption h5 {
  font-size: 1.75rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
}

/* Partners Section */
.partners-section {
  background-color: #ffffff;
}

.partners-grid {
  padding: 2rem 0;
  min-height: 250px;
  display: flex;
  align-items: center;
}

.partner-card {
  display: block;
  text-decoration: none;
  transition: transform 0.3s ease;
  padding: 1rem;
}

.partner-card:hover {
  transform: translateY(-5px);
}

.partner-logo-wrapper {
  background: #fff;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 150px;
}

.partner-card:hover .partner-logo-wrapper {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.partner-logo {
  max-width: 100%;
  max-height: 120px;
  width: auto;
  height: auto;
  object-fit: contain;
}

.partner-name {
  color: #333;
  font-weight: 600;
  font-size: 1rem;
  margin-top: 0.75rem;
  margin-bottom: 0;
}

.partners-control {
  filter: invert(1);
}

#partnersCarousel .carousel-control-prev,
#partnersCarousel .carousel-control-next {
  width: 5%;
}

#partnersCarousel .carousel-indicators {
  margin-bottom: -2rem;
}

#partnersCarousel .carousel-indicators button {
  background-color: #006517;
}

/* Responsive */
@media (max-width: 768px) {
  .section-title {
    font-size: 2rem;
  }
  
  .banner-wrapper {
    height: 350px;
  }
  
  .banner-content h1 {
    font-size: 2rem;
  }
  
  .banner-content p {
    font-size: 1rem;
  }
  
  .carousel-image {
    height: 300px;
  }
  
  .registration-card .btn {
    font-size: 1rem;
    padding: 0.6rem 1.5rem;
  }
  
  .feature-image {
    height: 250px;
  }
  
  .carousel-caption h5 {
    font-size: 1.25rem;
  }
  
  .partner-logo-wrapper {
    min-height: 120px;
    padding: 1rem;
  }
  
  .partner-logo {
    max-height: 100px;
  }
}

@media (max-width: 576px) {
  .section-title {
    font-size: 1.75rem;
  }
  
  .banner-wrapper {
    height: 250px;
  }
  
  .feature-text {
    font-size: 0.9rem;
  }
  
  .registration-card img {
    height: 200px;
  }
  
  .feature-image {
    height: 200px;
  }
  
  .carousel-image {
    height: 200px;
  }
  
  .partners-grid {
    min-height: 200px;
  }
  
  .partner-logo-wrapper {
    min-height: 100px;
    padding: 0.75rem;
  }
  
  .partner-logo {
    max-height: 80px;
  }
  
  .partner-name {
    font-size: 0.9rem;
  }
}
</style>

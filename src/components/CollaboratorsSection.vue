<template>
  <section class="testimonial-section" id="collaborators">
    <div class="testimonial-container">
      <h2 class="testimonial-title" v-reveal>Our Collaborators!</h2>

      <div class="collaborators-line">
        <RouterLink
          v-for="(c, i) in collaborators"
          :key="c.name"
          :to="{ path: '/Collaborators', query: { collaborator: c.slug } }"
          class="testimonial-figure-link"
          v-reveal="i * 90"
        >
          <figure class="testimonial-figure">
            <img :src="c.logo" :alt="c.name" class="author-img" />
            <div class="author-name">{{ c.name }}</div>
            <div class="author-role">{{ c.role }}</div>
          </figure>
        </RouterLink>
      </div>

      <RouterLink to="/Collaborators" class="collaborators-cta">See recycling impact by collaborator →</RouterLink>
    </div>
  </section>
</template>

<script setup>
import { RouterLink } from 'vue-router'

const collaborators = [
  { name: 'Dollarcity', role: '', slug: 'dollarcity', logo: '/assets/img/logo dollar.jpeg' },
  ]

</script>

<style scoped>
.testimonial-figure-link { display: block; text-decoration: none; color: inherit; }
.collaborators-cta {
  display: inline-block;
  margin-top: 28px;
  color: #F2C94C;
  font-weight: 600;
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.25s ease, opacity 0.25s ease;
}
.collaborators-cta:hover { border-color: #F2C94C; opacity: 0.85; }
</style>

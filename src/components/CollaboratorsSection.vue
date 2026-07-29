<template>
  <section class="testimonial-section" id="collaborators">
    <div class="testimonial-container">
      <h2 class="testimonial-title" v-reveal>Our Collaborators!</h2>

      <div class="collaborators-line">
        <figure v-for="(c, i) in collaborators" :key="c.name" class="testimonial-figure" v-reveal="i * 90">
          <img :src="c.logo" :alt="c.name" class="author-img" />
          <div class="author-name">{{ c.name }}</div>
          <div class="author-role">{{ c.role }}</div>
        </figure>
      </div>
    </div>
  </section>
</template>

<script setup>
const collaborators = [
  { name: 'Dollarcity', role: '', logo: '/assets/img/logo dollar.jpeg' },
  { name: 'ADOC',       role: '', logo: '/assets/img/adoc.png' },
]
</script>

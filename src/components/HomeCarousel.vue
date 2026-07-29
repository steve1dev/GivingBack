<template>
  <section class="sectionHero">
    <div class="carousel-container">
      <div
        v-for="(slide, i) in slides"
        :key="i"
        class="carousel-slide"
        :class="{ active: currentSlide === i }"
      >
        <img :src="slide.img" :alt="slide.title" />
        <div class="caption">
          <h2>{{ slide.title }}</h2>
          <p>{{ slide.desc }}</p>
        </div>
      </div>

      <button class="carousel-btn prev" @click="prev">❮</button>
      <button class="carousel-btn next" @click="next">❯</button>
    </div>

    <div class="dots">
      <span
        v-for="(_, i) in slides"
        :key="i"
        class="dot"
        :class="{ active: currentSlide === i }"
        @click="goTo(i)"
      />
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  slides: {
    type: Array,
    required: true,
  },
})

const currentSlide = ref(0)

function next() {
  currentSlide.value = (currentSlide.value + 1) % props.slides.length
}
function prev() {
  currentSlide.value = (currentSlide.value - 1 + props.slides.length) % props.slides.length
}
function goTo(i) {
  currentSlide.value = i
}
</script>

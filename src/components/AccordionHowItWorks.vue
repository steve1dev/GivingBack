<template>
  <p class="seccion-label" id="how-it-works" v-reveal>Learn more about Giving Back</p>
  <p class="seccion-titulo" v-reveal="60">Have questions? We'll explain it here.</p>

  <div class="acordeon-header" :class="{ open: !isOpen }" @click="isOpen = !isOpen" v-reveal="100">
    <span class="acordeon-title"> How does Giving Back work?</span>
    <span class="acordeon-arrow" :class="{ open: isOpen }">▼</span>
  </div>

  <div class="acordeon-body" :class="{ open: isOpen }">
    <div class="pasos">
      <template v-for="(step, i) in steps" :key="i">
        <div class="paso">
          <div class="paso-num">
            <template v-if="step.icon">
              <p>3</p>
            </template>
            <template v-else>{{ i + 1 }}</template>
          </div>
          <div>
            <p class="paso-title">{{ step.title }}</p>
            <p class="paso-desc">{{ step.desc }}</p>
          </div>
        </div>
        <div v-if="i < steps.length - 1" class="divider"></div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const isOpen = ref(false)

const steps = [
  {
    title: 'Register on the platform',
    desc: 'Create your free account and start being part of the Giving Back community.',
  },
  {
    title: 'Bring your materials to be recycled',
    desc: 'Collect cardboard, plastic, glass, appliances and more, and take them to a recycling point.',
  },
  {
    title: 'Earn Giving Points!',
    desc: 'Each recycled material gives you points.',
    icon: 'givingPoint',
  },
  {
    title: 'Redeem or keep accumulating',
    desc: 'Use your Giving Points to redeem rewards.',
  },
]
</script>

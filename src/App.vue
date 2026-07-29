<template>
  <RouterView v-slot="{ Component, route }">
    <Transition name="page-fade" mode="out-in">
      <div :key="route.path" class="router-view-wrapper">
        <component :is="Component" />
      </div>
    </Transition>
  </RouterView>
</template>

<script setup>
import { RouterView } from 'vue-router'
</script>

<style>
.router-view-wrapper {
  width: 100%;
}

.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}
.page-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (prefers-reduced-motion: reduce) {
  .page-fade-enter-active,
  .page-fade-leave-active {
    transition: none;
  }
}
</style>

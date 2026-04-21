<template>
  <svg :width="size" :height="size" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Star -->
    <template v-if="icon === 'star'">
      <polygon
        points="16,3 19.5,12.5 30,12.5 21.5,18.5 24.5,28 16,22 7.5,28 10.5,18.5 2,12.5 12.5,12.5"
        :fill="color" opacity="0.9"
      />
    </template>
    <!-- Heart -->
    <template v-else-if="icon === 'heart'">
      <path d="M16 27 C16 27 4 19 4 11 C4 7 7 4 11 4 C13.5 4 15.5 5.5 16 7 C16.5 5.5 18.5 4 21 4 C25 4 28 7 28 11 C28 19 16 27 16 27Z" :fill="color" opacity="0.9"/>
    </template>
    <!-- Flower -->
    <template v-else-if="icon === 'flower'">
      <ellipse cx="16" cy="8" rx="4" ry="6" :fill="color" opacity="0.8"/>
      <ellipse cx="16" cy="24" rx="4" ry="6" :fill="color" opacity="0.8"/>
      <ellipse cx="8" cy="16" rx="6" ry="4" :fill="color" opacity="0.8"/>
      <ellipse cx="24" cy="16" rx="6" ry="4" :fill="color" opacity="0.8"/>
      <circle cx="16" cy="16" r="5" :fill="color"/>
    </template>
    <!-- Sun -->
    <template v-else-if="icon === 'sun'">
      <circle cx="16" cy="16" r="6" :fill="color"/>
      <line v-for="i in 8" :key="i"
        :x1="16 + 8 * Math.cos((i-1) * Math.PI / 4)"
        :y1="16 + 8 * Math.sin((i-1) * Math.PI / 4)"
        :x2="16 + 12 * Math.cos((i-1) * Math.PI / 4)"
        :y2="16 + 12 * Math.sin((i-1) * Math.PI / 4)"
        :stroke="color" stroke-width="2.5" stroke-linecap="round"
      />
    </template>
    <!-- Moon -->
    <template v-else-if="icon === 'moon'">
      <path d="M22 16 C22 22 17.5 27 12 27 C9 27 6.5 25.5 5 23 C8 23 16 20 16 10 C16 7.5 15 5.5 13.5 4 C18.5 4 22 9.5 22 16Z" :fill="color" opacity="0.9"/>
    </template>
    <!-- Leaf -->
    <template v-else-if="icon === 'leaf'">
      <path d="M16 28 C16 28 6 20 6 10 C6 10 14 6 22 10 C22 10 24 18 16 28Z" :fill="color" opacity="0.9"/>
      <line x1="16" y1="28" x2="14" y2="12" stroke="white" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>
    </template>
    <!-- Crown -->
    <template v-else-if="icon === 'crown'">
      <polygon points="4,22 4,12 10,18 16,8 22,18 28,12 28,22" :fill="color" opacity="0.9"/>
      <rect x="4" y="22" width="24" height="4" rx="1" :fill="color"/>
    </template>
    <!-- Diamond -->
    <template v-else-if="icon === 'diamond'">
      <polygon points="16,4 28,14 16,28 4,14" :fill="color" opacity="0.9"/>
      <polygon points="16,4 28,14 16,14" :fill="color" opacity="0.6"/>
    </template>
  </svg>
</template>

<script setup lang="ts">
import type { StampIcon } from '../types'

withDefaults(defineProps<{
  icon: StampIcon
  color?: string
  size?: number
}>(), {
  color: '#c084fc',
  size: 32,
})
</script>

<template>
  <div class="stamp-grid" :style="gridStyle">
    <div
      v-for="(slot, i) in slots"
      :key="i"
      class="stamp-slot"
      :class="{
        filled: slot !== null,
        'just-stamped': justStampedIndex === i,
        'just-erased': justErasedIndex === i,
      }"
    >
      <template v-if="slot">
        <StampIcon
          :icon="slot.stampIcon"
          :color="iconColor(slot.stampIcon)"
          :size="slotSize"
        />
      </template>
      <template v-else>
        <div class="empty-dot" />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import StampIcon from './StampIcon.vue'
import type { PointLog, StampIcon as StampIconType } from '../types'

const props = defineProps<{
  slots: (PointLog | null)[]
  justStampedIndex?: number | null
  justErasedIndex?: number | null
}>()

const iconColors: Record<StampIconType, string> = {
  star:    '#f59e0b',
  heart:   '#f43f5e',
  flower:  '#ec4899',
  sun:     '#f97316',
  moon:    '#818cf8',
  leaf:    '#22c55e',
  crown:   '#eab308',
  diamond: '#38bdf8',
}

function iconColor(icon: StampIconType) {
  return iconColors[icon] ?? '#a78bfa'
}

const count = computed(() => props.slots.length)

const cols = computed(() => {
  if (count.value <= 6) return Math.min(count.value, 3)
  if (count.value <= 12) return 4
  return 5
})

const slotSize = computed(() => {
  if (cols.value <= 3) return 40
  if (cols.value === 4) return 36
  return 30
})

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${cols.value}, 1fr)`,
}))
</script>

<style scoped>
.stamp-grid {
  display: grid;
  gap: 10px;
  padding: 4px;
}

.stamp-slot {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: rgba(255,255,255,0.5);
  border: 1.5px dashed rgba(180,150,120,0.35);
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.stamp-slot.filled {
  background: rgba(255,255,255,0.8);
  border: 1.5px solid rgba(180,150,120,0.2);
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.empty-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(180,150,120,0.25);
}

/* Stamp animation */
.stamp-slot.just-stamped {
  animation: stamp-in 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.6) forwards;
}

@keyframes stamp-in {
  0%   { transform: scale(0.2) rotate(-15deg); opacity: 0; }
  60%  { transform: scale(1.18) rotate(3deg); opacity: 1; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}

/* Erase animation */
.stamp-slot.just-erased {
  animation: erase-out 0.35s ease-in forwards;
}

@keyframes erase-out {
  0%   { transform: scale(1); opacity: 1; }
  40%  { transform: scale(1.1) rotate(5deg); opacity: 0.7; }
  100% { transform: scale(0.3); opacity: 0; }
}
</style>

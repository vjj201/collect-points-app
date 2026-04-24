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
        clickable: slot !== null,
      }"
      @click="slot && onSlotClick(slot, i)"
    >
      <template v-if="slot">
        <StampIcon :icon="slot.stampIcon" :color="iconColor(slot.stampIcon)" :size="slotSize" />
      </template>
      <template v-else>
        <div class="empty-dot" />
      </template>
    </div>
  </div>

  <!-- Stamp detail tooltip/popup -->
  <Teleport to="body">
    <Transition name="tip-fade">
      <div v-if="activeLog" class="stamp-detail-overlay" @click.self="activeLog = null">
        <div class="stamp-detail" :style="detailStyle">
          <button class="detail-close" @click="activeLog = null">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>

          <div class="detail-icon">
            <StampIcon :icon="activeLog.stampIcon" :color="iconColor(activeLog.stampIcon)" :size="48" />
          </div>

          <div class="detail-row">
            <span class="detail-label">蓋章者</span>
            <div class="detail-user">
              <span class="detail-avatar">{{ getUser(activeLog.operatedBy)?.avatar ?? '👤' }}</span>
              <span class="detail-username">{{ getUser(activeLog.operatedBy)?.name ?? activeLog.operatedBy }}</span>
            </div>
          </div>

          <div class="detail-row">
            <span class="detail-label">日期</span>
            <span class="detail-value">{{ formatDate(activeLog.createdAt) }}</span>
          </div>

          <div class="detail-row">
            <span class="detail-label">時間</span>
            <span class="detail-value">{{ formatTime(activeLog.createdAt) }}</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import StampIcon from './StampIcon.vue'
import { useCardStore } from '../stores/cardStore'
import type { PointLog, StampIcon as StampIconType } from '../types'

const props = defineProps<{
  slots: (PointLog | null)[]
  justStampedIndex?: number | null
  justErasedIndex?: number | null
}>()

const store = useCardStore()

const activeLog = ref<PointLog | null>(null)
const detailStyle = ref({})

const iconColors: Record<StampIconType, string> = {
  star: '#f59e0b', heart: '#f43f5e', flower: '#ec4899', sun: '#f97316',
  moon: '#818cf8', leaf: '#22c55e', crown: '#eab308', diamond: '#38bdf8',
}
function iconColor(icon: StampIconType) { return iconColors[icon] ?? '#a78bfa' }

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
const gridStyle = computed(() => ({ gridTemplateColumns: `repeat(${cols.value}, 1fr)` }))

function onSlotClick(log: PointLog, _index: number) {
  activeLog.value = log
}

function getUser(userId: string) {
  return store.getUserById(userId)
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}
</script>

<style scoped>
.stamp-grid { display: grid; gap: 10px; padding: 4px; }

.stamp-slot {
  aspect-ratio: 1;
  display: flex; align-items: center; justify-content: center;
  border-radius: 12px;
  background: rgba(255,255,255,0.5);
  border: 1.5px dashed rgba(180,150,120,0.35);
  transition: all 0.2s ease;
  position: relative; overflow: hidden;
}

.stamp-slot.filled {
  background: rgba(255,255,255,0.8);
  border: 1.5px solid rgba(180,150,120,0.2);
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.stamp-slot.clickable { cursor: pointer; }
.stamp-slot.clickable:hover {
  transform: scale(1.08);
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  border-color: rgba(180,120,60,0.4);
}
.stamp-slot.clickable:active { transform: scale(0.96); }

.empty-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: rgba(180,150,120,0.25);
}

.stamp-slot.just-stamped { animation: stamp-in 0.45s cubic-bezier(0.175,0.885,0.32,1.6) forwards; }
@keyframes stamp-in {
  0%   { transform: scale(0.2) rotate(-15deg); opacity: 0; }
  60%  { transform: scale(1.18) rotate(3deg); opacity: 1; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}

.stamp-slot.just-erased { animation: erase-out 0.35s ease-in forwards; }
@keyframes erase-out {
  0%   { transform: scale(1); opacity: 1; }
  40%  { transform: scale(1.1) rotate(5deg); opacity: 0.7; }
  100% { transform: scale(0.3); opacity: 0; }
}

/* Detail popup */
.stamp-detail-overlay {
  position: fixed; inset: 0;
  display: flex; align-items: center; justify-content: center;
  z-index: 500; padding: 20px;
}

.stamp-detail {
  background: #fffaf5;
  border-radius: 20px;
  padding: 20px 20px 18px;
  min-width: 220px; max-width: 280px; width: 100%;
  box-shadow: 0 16px 48px rgba(0,0,0,0.18), 0 0 0 1px rgba(180,150,120,0.15);
  position: relative;
}

.detail-close {
  position: absolute; top: 12px; right: 12px;
  width: 28px; height: 28px; border-radius: 50%; border: none;
  background: rgba(61,43,31,0.08); color: #3d2b1f;
  display: flex; align-items: center; justify-content: center; cursor: pointer;
}
.detail-close svg { width: 13px; height: 13px; }
.detail-close:hover { background: rgba(61,43,31,0.14); }

.detail-icon {
  display: flex; justify-content: center;
  margin-bottom: 16px; padding-top: 4px;
}

.detail-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 9px 0;
  border-top: 1px solid rgba(180,150,120,0.15);
}

.detail-label {
  font-size: 12px; color: rgba(61,43,31,0.45);
  font-family: 'Noto Sans TC', sans-serif;
}

.detail-user {
  display: flex; align-items: center; gap: 6px;
}

.detail-avatar { font-size: 18px; line-height: 1; }

.detail-username {
  font-size: 14px; font-weight: 600; color: #3d2b1f;
  font-family: 'Noto Sans TC', sans-serif;
}

.detail-value {
  font-size: 14px; color: #3d2b1f;
  font-family: 'Noto Sans TC', sans-serif; font-weight: 500;
}

.tip-fade-enter-active, .tip-fade-leave-active { transition: opacity 0.2s; }
.tip-fade-enter-active .stamp-detail, .tip-fade-leave-active .stamp-detail { transition: transform 0.25s cubic-bezier(0.34,1.4,0.64,1); }
.tip-fade-enter-from, .tip-fade-leave-to { opacity: 0; }
.tip-fade-enter-from .stamp-detail, .tip-fade-leave-to .stamp-detail { transform: scale(0.88); }
</style>

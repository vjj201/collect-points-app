<template>
  <div class="detail-page" :class="`color-${card?.color}`">
    <div class="bg-texture" />

    <header class="detail-header">
      <button class="back-btn" @click="router.back()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
      <div class="points-badge">{{ currentPoints }} / {{ card?.maxPoints }} 點</div>
    </header>

    <main class="card-body" v-if="card">
      <!-- Wide layout: side by side -->
      <div class="layout-wrap">
        <!-- Card info panel -->
        <div class="card-panel">
          <div class="card-title-row">
            <div class="card-title-left">
              <h2 class="card-name">{{ card.name }}</h2>
              <p class="card-owner">{{ card.owner || '未設定擁有者' }}</p>
            </div>
            <div class="card-meta">
              <span class="meta-label">建立日期</span>
              <span class="meta-value">{{ card.createdAt }}</span>
            </div>
          </div>

          <!-- Description (shows on wide screens inline, narrow: below grid) -->
          <p v-if="card.description" class="card-description wide-only">{{ card.description }}</p>

          <div class="panel-divider" />

          <StampGrid
            :slots="slots"
            :just-stamped-index="justStampedIndex"
            :just-erased-index="justErasedIndex"
          />

          <!-- Description on narrow screens -->
          <p v-if="card.description" class="card-description narrow-only">{{ card.description }}</p>

          <Transition name="complete-fade">
            <div v-if="isComplete" class="complete-banner">🎉 集點完成！</div>
          </Transition>
        </div>
      </div>
    </main>

    <!-- Action bar -->
    <div class="action-bar">
      <div class="action-inner">
        <button
          class="action-btn erase-btn"
          :disabled="currentPoints <= 0"
          @click="erase"
          title="消除最後一個印章"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
          <span>消除</span>
        </button>

        <button
          class="action-btn stamp-btn"
          :disabled="isComplete"
          @click="showPicker = true"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          <span>蓋章</span>
        </button>
      </div>
    </div>

    <StampPicker :show="showPicker" @confirm="onStampConfirm" @cancel="showPicker = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCardStore } from '../stores/cardStore'
import StampGrid from '../components/StampGrid.vue'
import StampPicker from '../components/StampPicker.vue'
import type { StampIcon } from '../types'

const route = useRoute()
const router = useRouter()
const store = useCardStore()

const cardId = route.params.id as string
const card = computed(() => store.cards.find(c => c.id === cardId) ?? null)
const slots = computed(() => store.getCardSlots(cardId))
const currentPoints = computed(() => store.getCardPoints(cardId))
const isComplete = computed(() => card.value ? currentPoints.value >= card.value.maxPoints : false)

const showPicker = ref(false)
const justStampedIndex = ref<number | null>(null)
const justErasedIndex = ref<number | null>(null)

function onStampConfirm(icon: StampIcon) {
  showPicker.value = false
  const prev = currentPoints.value
  store.addStamp(cardId, icon)
  justStampedIndex.value = prev
  setTimeout(() => { justStampedIndex.value = null }, 600)
}

function erase() {
  if (currentPoints.value <= 0) return
  const prev = currentPoints.value
  store.removeStamp(cardId)
  justErasedIndex.value = prev - 1
  setTimeout(() => { justErasedIndex.value = null }, 500)
}
</script>

<style scoped>
.detail-page {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.color-peach   { background: #fde8d8; }
.color-mint    { background: #d4f5e9; }
.color-lavender{ background: #ede8fb; }
.color-butter  { background: #fdf6c3; }
.color-sky     { background: #dcf0fb; }

.bg-texture {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle at 80% 10%, rgba(255,255,255,0.5) 0%, transparent 50%);
  pointer-events: none;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 20px 0;
  position: relative;
  z-index: 10;
}

.back-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: rgba(61,43,31,0.12);
  color: #3d2b1f;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s;
}
.back-btn svg { width: 18px; height: 18px; }
.back-btn:hover { background: rgba(61,43,31,0.2); }

.points-badge {
  background: rgba(61,43,31,0.12);
  color: #3d2b1f;
  font-family: 'Noto Serif TC', serif;
  font-size: 14px;
  font-weight: 600;
  padding: 6px 16px;
  border-radius: 20px;
}

.card-body {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  z-index: 5;
}

.layout-wrap {
  width: 100%;
  max-width: 680px;
}

.card-panel {
  background: rgba(255,255,255,0.72);
  backdrop-filter: blur(14px);
  border-radius: 24px;
  padding: 28px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.08), 0 0 0 1px rgba(255,255,255,0.85);
}

.card-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.card-title-left { display: flex; flex-direction: column; gap: 4px; }

.card-name {
  font-family: 'Noto Serif TC', serif;
  font-size: 24px;
  font-weight: 700;
  color: #3d2b1f;
  margin: 0;
}

.card-owner {
  font-size: 13px;
  color: rgba(61,43,31,0.55);
  margin: 0;
  font-family: 'Noto Sans TC', sans-serif;
}

.card-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.meta-label {
  font-size: 10px;
  color: rgba(61,43,31,0.4);
  font-family: 'Noto Sans TC', sans-serif;
}

.meta-value {
  font-size: 12px;
  color: rgba(61,43,31,0.65);
  font-family: 'Noto Sans TC', sans-serif;
}

.card-description {
  font-size: 13px;
  color: rgba(61,43,31,0.65);
  font-family: 'Noto Sans TC', sans-serif;
  line-height: 1.7;
  margin: 0 0 16px;
}

.panel-divider {
  height: 1px;
  background: rgba(180,150,120,0.2);
  margin: 0 0 20px;
}

.complete-banner {
  margin-top: 20px;
  text-align: center;
  font-family: 'Noto Serif TC', serif;
  font-size: 18px;
  font-weight: 700;
  color: #92400e;
  background: rgba(251,191,36,0.22);
  border-radius: 12px;
  padding: 12px;
  border: 1.5px dashed rgba(251,191,36,0.5);
}

.complete-fade-enter-active { animation: bounce-in 0.5s cubic-bezier(0.34,1.56,0.64,1); }
@keyframes bounce-in { from { transform: scale(0.7); opacity: 0; } to { transform: scale(1); opacity: 1; } }

/* narrow-only / wide-only visibility */
.wide-only { display: none; }
.narrow-only { display: block; margin-top: 16px; }

@media (min-width: 600px) {
  .wide-only { display: block; }
  .narrow-only { display: none; }

  .card-name { font-size: 28px; }

  .card-panel { padding: 36px; }
}

/* Action bar */
.action-bar {
  padding: 14px 20px 32px;
  position: relative;
  z-index: 10;
  display: flex;
  justify-content: center;
}

.action-inner {
  display: flex;
  gap: 14px;
  width: 100%;
  max-width: 480px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 15px 20px;
  border: none;
  border-radius: 18px;
  font-size: 15px;
  font-family: 'Noto Serif TC', serif;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  white-space: nowrap;
}

.action-btn svg { width: 18px; height: 18px; flex-shrink: 0; }
.action-btn:disabled { opacity: 0.35; cursor: not-allowed; transform: none !important; box-shadow: none; }

.erase-btn {
  flex: 0 0 auto;
  min-width: 100px;
  background: rgba(255,255,255,0.72);
  color: #7c3d1a;
  border: 1.5px solid rgba(180,150,120,0.3);
}
.erase-btn:hover:not(:disabled) { background: rgba(255,255,255,0.92); transform: translateY(-2px); }

.stamp-btn {
  flex: 1;
  max-width: 260px;
  background: #3d2b1f;
  color: #fdf6ee;
}
.stamp-btn:hover:not(:disabled) { background: #5c3d28; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(61,43,31,0.3); }
</style>

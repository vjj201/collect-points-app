<template>
  <div
    class="carousel-wrap"
    :class="isHorizontal ? 'horizontal' : 'vertical'"
    @wheel.prevent="onWheel"
    @touchstart.passive="onTouchStart"
    @touchmove.prevent="onTouchMove"
    @touchend.passive="onTouchEnd"
  >
    <!-- Cards -->
    <div class="carousel-track" :style="trackStyle">
      <div
        v-for="(card, i) in cards"
        :key="card.id"
        class="carousel-item"
        :class="[
          `color-${card.color}`,
          {
            active: i === activeIndex,
            adjacent: Math.abs(i - activeIndex) === 1,
            far: Math.abs(i - activeIndex) >= 2,
            'is-redeemed': !!card.redeemedAt,
          }
        ]"
        @click="selectCard(i)"
      >
        <div class="card-inner">
          <div class="card-top-row">
            <span class="card-name">{{ card.name }}</span>
            <span class="card-date">{{ card.createdAt }}</span>
          </div>
          <div class="card-dots-preview">
            <span
              v-for="j in card.maxPoints"
              :key="j"
              class="dot"
              :class="{ filled: j <= getCardPoints(card.id) }"
            />
          </div>
          <div class="card-bottom-row">
            <div class="card-points-label">
              {{ getCardPoints(card.id) }} / {{ card.maxPoints }} 點
            </div>
            <!-- Status badge -->
            <span v-if="card.redeemedAt" class="card-status-badge redeemed">已兌換</span>
            <span v-else-if="getCardPoints(card.id) >= card.maxPoints" class="card-status-badge complete">已集滿</span>
          </div>
        </div>
        <!-- Redeemed stamp watermark -->
        <div v-if="card.redeemedAt" class="card-stamp-mark">
          <svg viewBox="0 0 60 60" fill="none">
            <circle cx="30" cy="30" r="26" stroke="rgba(120,60,10,0.5)" stroke-width="2" stroke-dasharray="5 2.5"/>
            <text x="30" y="28" text-anchor="middle" font-size="8" font-family="Noto Serif TC, serif" fill="rgba(120,60,10,0.7)" font-weight="700">已兌換</text>
            <text x="30" y="39" text-anchor="middle" font-size="6" font-family="Noto Sans TC, sans-serif" fill="rgba(120,60,10,0.55)">{{ card.redeemedAt }}</text>
          </svg>
        </div>
      </div>
    </div>

    <!-- Arrows -->
    <button
      class="nav-arrow arrow-prev"
      :class="{ visible: activeIndex > 0 }"
      @click="go(-1)"
      aria-label="上一張"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <template v-if="isHorizontal">
          <polyline points="15 18 9 12 15 6"/>
        </template>
        <template v-else>
          <polyline points="18 15 12 9 6 15"/>
        </template>
      </svg>
    </button>
    <button
      class="nav-arrow arrow-next"
      :class="{ visible: activeIndex < cards.length - 1 }"
      @click="go(1)"
      aria-label="下一張"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <template v-if="isHorizontal">
          <polyline points="9 18 15 12 9 6"/>
        </template>
        <template v-else>
          <polyline points="6 9 12 15 18 9"/>
        </template>
      </svg>
    </button>

    <!-- Dots indicator -->
    <div class="dots-indicator">
      <span
        v-for="(_, i) in cards"
        :key="i"
        class="indicator-dot"
        :class="{ active: i === activeIndex }"
        @click="selectCard(i)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useCardStore } from '../stores/cardStore'
import type { Card } from '../types'

const props = defineProps<{ cards: Card[] }>()
const emit = defineEmits<{ select: [id: string] }>()

const store = useCardStore()
const activeIndex = ref(0)
const windowWidth = ref(window.innerWidth)

const isHorizontal = computed(() => windowWidth.value >= 768)

// Card dimensions
const CARD_W = 340
const CARD_H = 144
const CARD_GAP = 16

const trackStyle = computed(() => {
  if (isHorizontal.value) {
    const step = CARD_W + CARD_GAP
    const offset = -(activeIndex.value * step + CARD_W / 2)
    return {
      flexDirection: 'row' as const,
      transform: `translateY(-50%) translateX(${offset}px)`,
      transition: 'transform 0.45s cubic-bezier(0.34,1.15,0.64,1)',
    }
  } else {
    const step = CARD_H + CARD_GAP
    const offset = -(activeIndex.value * step + CARD_H / 2)
    return {
      flexDirection: 'column' as const,
      transform: `translateX(-50%) translateY(${offset}px)`,
      transition: 'transform 0.45s cubic-bezier(0.34,1.15,0.64,1)',
    }
  }
})

function go(dir: 1 | -1) {
  const next = activeIndex.value + dir
  if (next >= 0 && next < props.cards.length) {
    selectCard(next)
  }
}

function selectCard(i: number) {
  activeIndex.value = i
  emit('select', props.cards[i].id)
}

let wheelCooldown = false
function onWheel(e: WheelEvent) {
  if (wheelCooldown) return
  const delta = isHorizontal.value ? e.deltaX || e.deltaY : e.deltaY
  if (delta > 20) go(1)
  else if (delta < -20) go(-1)
  wheelCooldown = true
  setTimeout(() => { wheelCooldown = false }, 350)
}

let touchStartX = 0
let touchStartY = 0
function onTouchStart(e: TouchEvent) {
  touchStartX = e.touches[0].clientX
  touchStartY = e.touches[0].clientY
}
function onTouchMove(e: TouchEvent) { e.preventDefault() }
function onTouchEnd(e: TouchEvent) {
  const dx = touchStartX - e.changedTouches[0].clientX
  const dy = touchStartY - e.changedTouches[0].clientY
  if (isHorizontal.value) {
    if (dx > 40) go(1)
    else if (dx < -40) go(-1)
  } else {
    if (dy > 40) go(1)
    else if (dy < -40) go(-1)
  }
}

function onResize() { windowWidth.value = window.innerWidth }
onMounted(() => window.addEventListener('resize', onResize))
onUnmounted(() => window.removeEventListener('resize', onResize))

function getCardPoints(cardId: string) {
  return store.getCardPoints(cardId)
}
</script>

<style scoped>
.carousel-wrap {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.carousel-track {
  position: absolute;
  display: flex;
  gap: 16px;
}

/* Vertical mode: anchored at left:50%, top:50% */
.vertical .carousel-track {
  left: 50%;
  top: 50%;
  flex-direction: column;
}

/* Horizontal mode: anchored at left:50%, top:50% */
.horizontal .carousel-track {
  left: 50%;
  top: 50%;
  flex-direction: row;
}

.carousel-item {
  flex-shrink: 0;
  width: 340px;
  height: 144px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.45s cubic-bezier(0.34,1.15,0.64,1);
  transform-origin: center;
  padding: 20px;
  box-sizing: border-box;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

.carousel-item.active {
  transform: scale(1.06);
  box-shadow: 0 14px 44px rgba(0,0,0,0.16);
  z-index: 2;
}

.carousel-item.adjacent {
  transform: scale(0.92);
  opacity: 0.6;
}

.carousel-item.far {
  transform: scale(0.82);
  opacity: 0.3;
}

/* Card colors */
.color-peach   { background: linear-gradient(135deg, #fde8d8 0%, #f9c4a4 100%); }
.color-mint    { background: linear-gradient(135deg, #d4f5e9 0%, #a7eacf 100%); }
.color-lavender{ background: linear-gradient(135deg, #ede8fb 0%, #d5c8f7 100%); }
.color-butter  { background: linear-gradient(135deg, #fdf6c3 0%, #f9e87a 100%); }
.color-sky     { background: linear-gradient(135deg, #dcf0fb 0%, #a8d8f5 100%); }

.card-inner {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.card-top-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.card-name {
  font-family: 'Noto Serif TC', serif;
  font-size: 16px;
  font-weight: 700;
  color: #3d2b1f;
}

.card-date {
  font-size: 10px;
  color: rgba(61,43,31,0.5);
  font-family: 'Noto Sans TC', sans-serif;
}

.card-dots-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255,255,255,0.45);
  border: 1px solid rgba(180,150,120,0.3);
  transition: background 0.2s;
}

.dot.filled {
  background: rgba(61,43,31,0.35);
  border-color: transparent;
}

.card-bottom-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-points-label {
  font-size: 11px;
  color: rgba(61,43,31,0.55);
  font-family: 'Noto Sans TC', sans-serif;
}

.card-status-badge {
  font-size: 10px;
  font-family: 'Noto Sans TC', sans-serif;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
  letter-spacing: 0.04em;
}

.card-status-badge.complete {
  background: rgba(251,191,36,0.35);
  color: #92400e;
}

.card-status-badge.redeemed {
  background: rgba(120,60,10,0.15);
  color: #78350f;
}

/* Redeemed watermark stamp */
.carousel-item {
  position: relative;
  overflow: hidden;
}

.card-stamp-mark {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%) rotate(-12deg);
  opacity: 0.75;
  pointer-events: none;
}

.card-stamp-mark svg {
  width: 64px;
  height: 64px;
}

/* Dim redeemed cards slightly */
.carousel-item.is-redeemed {
  filter: saturate(0.6);
}

/* Nav arrows */
.nav-arrow {
  position: absolute;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: rgba(61,43,31,0.9);
  color: #fdf6ee;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  pointer-events: none;
  transition: all 0.25s ease;
  z-index: 10;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
}

.nav-arrow svg { width: 22px; height: 22px; }
.nav-arrow.visible { opacity: 1; pointer-events: auto; }
.nav-arrow:hover { background: #3d2b1f; transform: scale(1.1); }
.nav-arrow:active { transform: scale(0.96); }

/* Vertical arrow positions */
.vertical .arrow-prev { top: 16px; left: 50%; transform: translateX(-50%); }
.vertical .arrow-prev:hover { transform: translateX(-50%) scale(1.1); }
.vertical .arrow-next { bottom: 16px; left: 50%; transform: translateX(-50%); }
.vertical .arrow-next:hover { transform: translateX(-50%) scale(1.1); }

/* Horizontal arrow positions */
.horizontal .arrow-prev { left: 16px; top: 50%; transform: translateY(-50%); }
.horizontal .arrow-prev:hover { transform: translateY(-50%) scale(1.1); }
.horizontal .arrow-next { right: 16px; top: 50%; transform: translateY(-50%); }
.horizontal .arrow-next:hover { transform: translateY(-50%) scale(1.1); }

/* Dots indicator */
.dots-indicator {
  position: absolute;
  display: flex;
  gap: 6px;
  z-index: 10;
}

.vertical .dots-indicator {
  flex-direction: column;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
}

.horizontal .dots-indicator {
  flex-direction: row;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
}

.indicator-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: rgba(61,43,31,0.2);
  cursor: pointer;
  transition: all 0.25s ease;
}

.indicator-dot.active {
  background: rgba(61,43,31,0.75);
  transform: scale(1.3);
}
</style>

<template>
  <div class="home">
    <div class="bg-texture" />

    <header class="home-header">
      <h1 class="title">集點卡</h1>
      <button class="add-btn" @click="router.push('/create')" title="新增集點卡">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>
    </header>

    <main class="carousel-area">
      <CardCarousel :cards="store.cards" @select="onSelect" />
    </main>

    <footer class="home-footer">
      <button class="enter-btn" @click="enterCard" :disabled="!store.selectedCardId">
        查看
      </button>
      <p class="swipe-hint">{{ isWide ? '← → 滑動切換集點卡' : '↕ 滑動切換集點卡' }}</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCardStore } from '../stores/cardStore'
import CardCarousel from '../components/CardCarousel.vue'

const router = useRouter()
const store = useCardStore()
const isWide = ref(window.innerWidth >= 768)

function onResize() { isWide.value = window.innerWidth >= 768 }
onMounted(() => window.addEventListener('resize', onResize))
onUnmounted(() => window.removeEventListener('resize', onResize))

function onSelect(id: string) { store.selectedCardId = id }
function enterCard() {
  if (store.selectedCardId) router.push(`/card/${store.selectedCardId}`)
}
</script>

<style scoped>
.home {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: #fdf6ee;
  position: relative;
  overflow: hidden;
}

.bg-texture {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at 20% 20%, rgba(253,200,170,0.25) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(200,230,210,0.25) 0%, transparent 50%),
    radial-gradient(circle at 60% 30%, rgba(220,210,250,0.2) 0%, transparent 40%);
  pointer-events: none;
}

.home-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 0;
  position: relative;
  z-index: 10;
}

.title {
  font-family: 'Noto Serif TC', serif;
  font-size: 28px;
  font-weight: 700;
  color: #3d2b1f;
  margin: 0;
  letter-spacing: 0.05em;
}

.add-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: #3d2b1f;
  color: #fdf6ee;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(61,43,31,0.25);
  transition: all 0.2s ease;
}
.add-btn svg { width: 20px; height: 20px; }
.add-btn:hover { transform: scale(1.1) rotate(90deg); background: #5c3d28; }

.carousel-area {
  flex: 1;
  position: relative;
  overflow: hidden;
  /* 讓 carousel 盡量撐高，footer 控制在底部 */
  min-height: 0;
}

.home-footer {
  padding: 16px 24px 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  position: relative;
  z-index: 10;
}

.enter-btn {
  width: 100%;
  max-width: 240px;
  padding: 14px 32px;
  border: none;
  border-radius: 18px;
  background: #3d2b1f;
  color: #fdf6ee;
  font-family: 'Noto Serif TC', serif;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.1em;
  cursor: pointer;
  box-shadow: 0 6px 24px rgba(61,43,31,0.2);
  transition: all 0.2s ease;
}

.enter-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(61,43,31,0.28); }
.enter-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.swipe-hint {
  font-size: 12px;
  color: rgba(61,43,31,0.4);
  margin: 0;
  font-family: 'Noto Sans TC', sans-serif;
}
</style>

<template>
  <!-- 全域 loading 畫面 -->
  <div v-if="store.loading" class="global-loading">
    <div class="loading-spinner" />
    <p>載入中…</p>
  </div>

  <!-- 全域 error toast -->
  <Transition name="toast">
    <div v-if="store.error" class="error-toast" @click="store.error = null">
      ⚠️ {{ store.error }}
    </div>
  </Transition>

  <!-- 主畫面 -->
  <RouterView v-if="!store.loading" v-slot="{ Component }">
    <Transition name="page" mode="out-in">
      <component :is="Component" />
    </Transition>
  </RouterView>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useCardStore } from './stores/cardStore'

const store = useCardStore()

onMounted(async () => {
  await store.init()
})

onUnmounted(() => {
  store.dispose()
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;600;700&family=Noto+Sans+TC:wght@400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html, body { height: 100%; -webkit-tap-highlight-color: transparent; }

#app { height: 100%; min-height: 100dvh; }

/* Page transition */
.page-enter-active, .page-leave-active { transition: all 0.28s ease; }
.page-enter-from { opacity: 0; transform: translateX(24px); }
.page-leave-to   { opacity: 0; transform: translateX(-24px); }

/* Global loading */
.global-loading {
  height: 100dvh;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 16px;
  background: #fdf6ee;
}

.loading-spinner {
  width: 40px; height: 40px;
  border: 3px solid rgba(61,43,31,0.15);
  border-top-color: #d97706;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.global-loading p {
  font-family: 'Noto Serif TC', serif;
  font-size: 15px; color: rgba(61,43,31,0.6);
}

/* Error toast */
.error-toast {
  position: fixed;
  bottom: 24px; left: 50%;
  transform: translateX(-50%);
  background: #3d2b1f;
  color: #fdf6ee;
  padding: 12px 20px;
  border-radius: 14px;
  font-size: 13px;
  font-family: 'Noto Sans TC', sans-serif;
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
  cursor: pointer;
  z-index: 9999;
  white-space: nowrap;
  max-width: calc(100vw - 40px);
  overflow: hidden;
  text-overflow: ellipsis;
}

.toast-enter-active, .toast-leave-active { transition: all 0.3s cubic-bezier(0.34,1.4,0.64,1); }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(16px); }
</style>

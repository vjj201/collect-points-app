<template>
  <Teleport to="body">
    <Transition name="picker-fade">
      <div v-if="show" class="picker-overlay" @click.self="$emit('cancel')">
        <div class="picker-panel">
          <p class="picker-title">選擇印章圖案</p>
          <div class="picker-grid">
            <button
              v-for="icon in icons"
              :key="icon.key"
              class="picker-btn"
              :class="{ selected: selected === icon.key }"
              @click="selected = icon.key"
            >
              <StampIcon :icon="icon.key" :color="icon.color" :size="36" />
              <span class="icon-label">{{ icon.label }}</span>
            </button>
          </div>
          <div class="picker-actions">
            <button class="btn-cancel" @click="$emit('cancel')">取消</button>
            <button class="btn-confirm" :disabled="!selected" @click="confirm">蓋章！</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import StampIcon from './StampIcon.vue'
import type { StampIcon as StampIconType } from '../types'

defineProps<{ show: boolean }>()
const emit = defineEmits<{
  confirm: [icon: StampIconType]
  cancel: []
}>()

const selected = ref<StampIconType | null>(null)

const icons: { key: StampIconType; label: string; color: string }[] = [
  { key: 'star',    label: '星星', color: '#f59e0b' },
  { key: 'heart',   label: '愛心', color: '#f43f5e' },
  { key: 'flower',  label: '花朵', color: '#ec4899' },
  { key: 'sun',     label: '太陽', color: '#f97316' },
  { key: 'moon',    label: '月亮', color: '#818cf8' },
  { key: 'leaf',    label: '樹葉', color: '#22c55e' },
  { key: 'crown',   label: '皇冠', color: '#eab308' },
  { key: 'diamond', label: '鑽石', color: '#38bdf8' },
]

function confirm() {
  if (!selected.value) return
  emit('confirm', selected.value)
  selected.value = null
}
</script>

<style scoped>
.picker-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.35);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 100;
  padding-bottom: env(safe-area-inset-bottom);
}

.picker-panel {
  background: #fffaf5;
  border-radius: 24px 24px 0 0;
  padding: 28px 24px 36px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 -8px 40px rgba(0,0,0,0.12);
}

.picker-title {
  font-family: 'Noto Serif TC', serif;
  font-size: 17px;
  font-weight: 600;
  color: #3d2b1f;
  text-align: center;
  margin: 0 0 20px;
}

.picker-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.picker-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  border: 2px solid transparent;
  border-radius: 16px;
  background: #fff;
  cursor: pointer;
  transition: all 0.18s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.picker-btn:hover {
  transform: scale(1.06);
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
}

.picker-btn.selected {
  border-color: #d97706;
  background: #fffbeb;
  transform: scale(1.08);
}

.icon-label {
  font-size: 11px;
  color: #78716c;
  font-family: 'Noto Sans TC', sans-serif;
}

.picker-actions {
  display: flex;
  gap: 12px;
}

.btn-cancel {
  flex: 1;
  padding: 14px;
  border: 1.5px solid #d6cdc4;
  border-radius: 14px;
  background: transparent;
  color: #78716c;
  font-size: 15px;
  font-family: 'Noto Sans TC', sans-serif;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-cancel:hover { background: #f5f0eb; }

.btn-confirm {
  flex: 2;
  padding: 14px;
  border: none;
  border-radius: 14px;
  background: #d97706;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  font-family: 'Noto Sans TC', sans-serif;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-confirm:hover:not(:disabled) { background: #b45309; transform: scale(1.02); }
.btn-confirm:disabled { opacity: 0.4; cursor: not-allowed; }

.picker-fade-enter-active, .picker-fade-leave-active { transition: opacity 0.25s ease; }
.picker-fade-enter-active .picker-panel, .picker-fade-leave-active .picker-panel { transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1); }
.picker-fade-enter-from, .picker-fade-leave-to { opacity: 0; }
.picker-fade-enter-from .picker-panel, .picker-fade-leave-to .picker-panel { transform: translateY(100%); }
</style>

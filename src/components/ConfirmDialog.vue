<template>
  <Teleport to="body">
    <Transition name="dialog-fade">
      <div v-if="show" class="dialog-overlay" @click.self="$emit('cancel')">
        <div class="dialog">
          <p class="dialog-title">{{ title }}</p>
          <p class="dialog-msg">{{ message }}</p>
          <div class="dialog-actions">
            <button class="btn-cancel" @click="$emit('cancel')">取消</button>
            <button class="btn-confirm" @click="$emit('confirm')">{{ confirmLabel }}</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean
  title: string
  message: string
  confirmLabel?: string
}>()
defineEmits<{ confirm: []; cancel: [] }>()
</script>

<style scoped>
.dialog-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.35);
  display: flex; align-items: center; justify-content: center;
  z-index: 300; padding: 20px;
}

.dialog {
  background: #fffaf5;
  border-radius: 20px;
  padding: 28px 24px 20px;
  width: 100%; max-width: 320px;
  box-shadow: 0 16px 48px rgba(0,0,0,0.18);
}

.dialog-title {
  font-family: 'Noto Serif TC', serif;
  font-size: 17px; font-weight: 700;
  color: #3d2b1f; margin: 0 0 8px;
  text-align: center;
}

.dialog-msg {
  font-size: 13px;
  color: rgba(61,43,31,0.65);
  font-family: 'Noto Sans TC', sans-serif;
  text-align: center; line-height: 1.6;
  margin: 0 0 20px;
}

.dialog-actions { display: flex; gap: 10px; }

.btn-cancel {
  flex: 1; padding: 12px;
  border: 1.5px solid rgba(180,150,120,0.3);
  border-radius: 12px; background: transparent;
  color: rgba(61,43,31,0.6); font-size: 14px;
  font-family: 'Noto Sans TC', sans-serif; cursor: pointer;
}
.btn-cancel:hover { background: rgba(61,43,31,0.05); }

.btn-confirm {
  flex: 1; padding: 12px;
  border: none; border-radius: 12px;
  background: #c0392b; color: #fff;
  font-size: 14px; font-weight: 600;
  font-family: 'Noto Sans TC', sans-serif; cursor: pointer;
  transition: background 0.15s;
}
.btn-confirm:hover { background: #a93226; }

.dialog-fade-enter-active, .dialog-fade-leave-active { transition: opacity 0.2s; }
.dialog-fade-enter-active .dialog, .dialog-fade-leave-active .dialog { transition: transform 0.25s cubic-bezier(0.34,1.4,0.64,1); }
.dialog-fade-enter-from, .dialog-fade-leave-to { opacity: 0; }
.dialog-fade-enter-from .dialog, .dialog-fade-leave-to .dialog { transform: scale(0.88); }
</style>

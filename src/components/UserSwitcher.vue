<template>
  <div class="user-wrap" ref="wrapRef">
    <button class="user-btn" @click="open = !open">
      <div class="avatar">{{ initial }}</div>
      <svg class="chevron" :class="{ up: open }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    </button>

    <Transition name="dropdown">
      <div v-if="open" class="dropdown">
        <p class="dropdown-label">切換使用者</p>
        <button
          v-for="u in users"
          :key="u"
          class="user-option"
          :class="{ active: u === current }"
          @click="select(u)"
        >
          <div class="opt-avatar">{{ u[0] }}</div>
          <span>{{ u }}</span>
          <svg v-if="u === current" class="check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </button>
        <div class="dropdown-divider" />
        <!-- Add new user -->
        <div v-if="!addingUser" class="add-user-row">
          <button class="add-user-btn" @click="addingUser = true">＋ 新增使用者</button>
        </div>
        <div v-else class="add-user-row">
          <input
            ref="newUserInput"
            v-model="newUserName"
            class="new-user-input"
            placeholder="輸入名稱"
            maxlength="10"
            @keyup.enter="confirmAdd"
            @keyup.esc="addingUser = false"
          />
          <button class="confirm-add" @click="confirmAdd">確定</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'

const props = defineProps<{ current: string; users: string[] }>()
const emit = defineEmits<{
  'update:current': [v: string]
  'addUser': [v: string]
}>()

const open = ref(false)
const addingUser = ref(false)
const newUserName = ref('')
const wrapRef = ref<HTMLElement | null>(null)
const newUserInput = ref<HTMLInputElement | null>(null)

const initial = computed(() => props.current?.[0] ?? '?')

function select(u: string) {
  emit('update:current', u)
  open.value = false
  addingUser.value = false
}

async function confirmAdd() {
  const name = newUserName.value.trim()
  if (!name) return
  emit('addUser', name)
  emit('update:current', name)
  newUserName.value = ''
  addingUser.value = false
  open.value = false
}

watch(() => addingUser.value, async (v) => {
  if (v) { await nextTick(); newUserInput.value?.focus() }
})

function onClickOutside(e: MouseEvent) {
  if (wrapRef.value && !wrapRef.value.contains(e.target as Node)) {
    open.value = false
    addingUser.value = false
  }
}
onMounted(() => document.addEventListener('mousedown', onClickOutside))
onUnmounted(() => document.removeEventListener('mousedown', onClickOutside))
</script>

<script lang="ts">
import { watch } from 'vue'
</script>

<style scoped>
.user-wrap { position: relative; }

.user-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px 4px 4px;
  border-radius: 24px;
  border: 1.5px solid rgba(180,150,120,0.25);
  background: rgba(255,255,255,0.6);
  cursor: pointer;
  transition: background 0.15s;
}
.user-btn:hover { background: rgba(255,255,255,0.9); }

.avatar {
  width: 32px; height: 32px;
  border-radius: 50%;
  background: #3d2b1f;
  color: #fdf6ee;
  font-family: 'Noto Serif TC', serif;
  font-size: 14px;
  font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}

.chevron {
  width: 14px; height: 14px;
  color: rgba(61,43,31,0.5);
  transition: transform 0.2s;
}
.chevron.up { transform: rotate(180deg); }

/* Dropdown */
.dropdown {
  position: absolute;
  right: 0; top: calc(100% + 8px);
  background: #fffaf5;
  border-radius: 16px;
  padding: 12px 0 8px;
  min-width: 180px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.14), 0 0 0 1px rgba(180,150,120,0.15);
  z-index: 100;
}

.dropdown-label {
  font-size: 11px;
  font-weight: 600;
  color: rgba(61,43,31,0.4);
  letter-spacing: 0.08em;
  font-family: 'Noto Sans TC', sans-serif;
  padding: 0 14px 6px;
  margin: 0;
}

.user-option {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 14px;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: background 0.12s;
  text-align: left;
}
.user-option:hover { background: rgba(61,43,31,0.05); }
.user-option.active { background: rgba(61,43,31,0.06); }

.opt-avatar {
  width: 28px; height: 28px;
  border-radius: 50%;
  background: rgba(61,43,31,0.12);
  color: #3d2b1f;
  font-family: 'Noto Serif TC', serif;
  font-size: 13px;
  font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.user-option span {
  flex: 1;
  font-size: 14px;
  color: #3d2b1f;
  font-family: 'Noto Sans TC', sans-serif;
}

.check { width: 15px; height: 15px; color: #d97706; flex-shrink: 0; }

.dropdown-divider {
  height: 1px;
  background: rgba(180,150,120,0.18);
  margin: 8px 0;
}

.add-user-row {
  display: flex;
  gap: 6px;
  padding: 0 10px 4px;
}

.add-user-btn {
  width: 100%;
  padding: 8px 4px;
  border: none;
  background: transparent;
  color: rgba(61,43,31,0.55);
  font-size: 13px;
  font-family: 'Noto Sans TC', sans-serif;
  cursor: pointer;
  text-align: left;
  border-radius: 8px;
  transition: background 0.12s;
}
.add-user-btn:hover { background: rgba(61,43,31,0.05); color: #3d2b1f; }

.new-user-input {
  flex: 1;
  padding: 7px 10px;
  border: 1.5px solid rgba(180,150,120,0.35);
  border-radius: 10px;
  background: #fff;
  font-size: 13px;
  font-family: 'Noto Sans TC', sans-serif;
  color: #3d2b1f;
  outline: none;
}
.new-user-input:focus { border-color: rgba(180,120,60,0.5); }

.confirm-add {
  padding: 7px 10px;
  border: none;
  border-radius: 10px;
  background: #3d2b1f;
  color: #fdf6ee;
  font-size: 13px;
  font-family: 'Noto Sans TC', sans-serif;
  cursor: pointer;
}

.dropdown-enter-active, .dropdown-leave-active { transition: all 0.2s cubic-bezier(0.34,1.4,0.64,1); }
.dropdown-enter-from, .dropdown-leave-to { opacity: 0; transform: translateY(-8px) scale(0.96); }
</style>

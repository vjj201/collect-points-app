<template>
  <div class="user-wrap" ref="wrapRef">
    <!-- Trigger -->
    <button class="user-btn" @click="openMain">
      <span class="avatar-emoji">{{ currentUser?.avatar ?? '👤' }}</span>
      <svg class="chevron" :class="{ up: mode !== 'closed' }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    </button>

    <!-- Main dropdown -->
    <Transition name="dropdown">
      <div v-if="mode === 'main'" class="dropdown">
        <p class="dropdown-label">切換使用者</p>

        <div class="user-list">
          <button
            v-for="u in users" :key="u.id"
            class="user-option" :class="{ active: u.id === currentUserId }"
            @click="select(u.id)"
          >
            <span class="opt-emoji">{{ u.avatar }}</span>
            <span class="opt-name">{{ u.name }}</span>
            <div class="opt-right">
              <svg v-if="u.id === currentUserId" class="check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <button class="delete-user-btn" @click.stop="askDelete(u)" title="刪除使用者">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </button>
        </div>

        <div class="dropdown-divider" />
        <button class="add-user-btn" @click="mode = 'add'">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          新增使用者
        </button>
      </div>
    </Transition>

    <!-- Add user panel -->
    <Transition name="dropdown">
      <div v-if="mode === 'add'" class="dropdown add-panel">
        <div class="add-header">
          <button class="back-btn" @click="mode = 'main'">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <span class="dropdown-label" style="margin:0">新增使用者</span>
        </div>

        <input
          ref="nameInputRef"
          v-model="newName"
          class="name-input"
          placeholder="輸入名稱"
          maxlength="10"
          @keyup.enter="confirmAdd"
        />

        <p class="avatar-section-label">選擇動物圖案</p>
        <div class="avatar-grid">
          <button
            v-for="emoji in ANIMAL_AVATARS" :key="emoji"
            class="avatar-option" :class="{ selected: newAvatar === emoji }"
            @click="newAvatar = emoji"
          >{{ emoji }}</button>
        </div>

        <button class="confirm-btn" :disabled="!newName.trim() || !newAvatar" @click="confirmAdd">
          建立
        </button>
      </div>
    </Transition>

    <!-- Delete confirm inline -->
    <Transition name="dropdown">
      <div v-if="mode === 'delete'" class="dropdown delete-panel">
        <p class="delete-title">刪除使用者</p>
        <div class="delete-user-preview">
          <span class="preview-emoji">{{ deletingUser?.avatar }}</span>
          <span class="preview-name">{{ deletingUser?.name }}</span>
        </div>
        <p class="delete-msg">刪除後該使用者的集點卡將失去擁有者，此操作無法還原。</p>
        <div class="delete-actions">
          <button class="btn-cancel" @click="mode = 'main'">取消</button>
          <button class="btn-delete" @click="confirmDelete">刪除</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted, watch } from 'vue'
import { ANIMAL_AVATARS } from '../types'
import type { User } from '../types'

const props = defineProps<{
  currentUserId: string
  currentUser: User | null
  users: User[]
}>()

const emit = defineEmits<{
  'update:currentUserId': [id: string]
  'addUser': [payload: { name: string; avatar: string }]
  'deleteUser': [id: string]
}>()

type Mode = 'closed' | 'main' | 'add' | 'delete'
const mode = ref<Mode>('closed')
const wrapRef = ref<HTMLElement | null>(null)
const nameInputRef = ref<HTMLInputElement | null>(null)
const newName = ref('')
const newAvatar = ref('')
const deletingUser = ref<User | null>(null)

function openMain() {
  mode.value = mode.value === 'closed' ? 'main' : 'closed'
}

function select(id: string) {
  emit('update:currentUserId', id)
  mode.value = 'closed'
}

function askDelete(u: User) {
  deletingUser.value = u
  mode.value = 'delete'
}

function confirmDelete() {
  if (deletingUser.value) {
    emit('deleteUser', deletingUser.value.id)
    deletingUser.value = null
  }
  mode.value = 'main'
}

function confirmAdd() {
  const name = newName.value.trim()
  if (!name || !newAvatar.value) return
  emit('addUser', { name, avatar: newAvatar.value })
  newName.value = ''
  newAvatar.value = ''
  mode.value = 'closed'
}

watch(() => mode.value, async (v) => {
  if (v === 'add') {
    await nextTick()
    nameInputRef.value?.focus()
  }
})

function onOutside(e: MouseEvent) {
  if (wrapRef.value && !wrapRef.value.contains(e.target as Node)) mode.value = 'closed'
}
onMounted(() => document.addEventListener('mousedown', onOutside))
onUnmounted(() => document.removeEventListener('mousedown', onOutside))
</script>

<style scoped>
.user-wrap { position: relative; }

.user-btn {
  display: flex; align-items: center; gap: 4px;
  padding: 4px 8px 4px 6px;
  border-radius: 24px;
  border: 1.5px solid rgba(180,150,120,0.25);
  background: rgba(255,255,255,0.6);
  cursor: pointer; transition: background 0.15s;
}
.user-btn:hover { background: rgba(255,255,255,0.9); }

.avatar-emoji { font-size: 22px; line-height: 1; }

.chevron { width: 14px; height: 14px; color: rgba(61,43,31,0.5); transition: transform 0.2s; }
.chevron.up { transform: rotate(180deg); }

/* Dropdown base */
.dropdown {
  position: absolute; right: 0; top: calc(100% + 8px);
  background: #fffaf5;
  border-radius: 16px;
  padding: 12px 0 10px;
  min-width: 210px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.14), 0 0 0 1px rgba(180,150,120,0.15);
  z-index: 100;
}

.dropdown-label {
  font-size: 11px; font-weight: 600;
  color: rgba(61,43,31,0.4);
  letter-spacing: 0.08em;
  font-family: 'Noto Sans TC', sans-serif;
  padding: 0 14px 8px; margin: 0; display: block;
}

.user-list { display: flex; flex-direction: column; }

.user-option {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 10px 8px 14px;
  border: none; background: transparent;
  cursor: pointer; transition: background 0.12s; text-align: left; width: 100%;
}
.user-option:hover { background: rgba(61,43,31,0.05); }
.user-option.active { background: rgba(61,43,31,0.06); }

.opt-emoji { font-size: 20px; line-height: 1; flex-shrink: 0; }
.opt-name { flex: 1; font-size: 14px; color: #3d2b1f; font-family: 'Noto Sans TC', sans-serif; }

.opt-right { display: flex; align-items: center; gap: 4px; }

.check { width: 15px; height: 15px; color: #d97706; }

.delete-user-btn {
  width: 26px; height: 26px; border-radius: 50%; border: none;
  background: transparent; color: rgba(61,43,31,0.3);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.15s; flex-shrink: 0;
}
.delete-user-btn svg { width: 13px; height: 13px; }
.delete-user-btn:hover { background: rgba(192,57,43,0.1); color: #c0392b; }

.dropdown-divider { height: 1px; background: rgba(180,150,120,0.18); margin: 8px 0; }

.add-user-btn {
  display: flex; align-items: center; gap: 7px;
  width: 100%; padding: 8px 14px; border: none;
  background: transparent; color: rgba(61,43,31,0.55);
  font-size: 13px; font-family: 'Noto Sans TC', sans-serif;
  cursor: pointer; text-align: left; transition: background 0.12s;
}
.add-user-btn:hover { background: rgba(61,43,31,0.05); color: #3d2b1f; }

/* Add panel */
.add-panel { padding: 14px; min-width: 260px; }

.add-header {
  display: flex; align-items: center; gap: 8px; margin-bottom: 12px;
}

.back-btn {
  width: 28px; height: 28px; border-radius: 50%; border: none;
  background: rgba(61,43,31,0.08); color: #3d2b1f;
  display: flex; align-items: center; justify-content: center; cursor: pointer;
}
.back-btn svg { width: 14px; height: 14px; }

.name-input {
  width: 100%; padding: 9px 12px;
  border: 1.5px solid rgba(180,150,120,0.3); border-radius: 10px;
  background: #fff; font-size: 14px;
  font-family: 'Noto Sans TC', sans-serif; color: #3d2b1f;
  outline: none; box-sizing: border-box; margin-bottom: 12px;
}
.name-input:focus { border-color: rgba(180,120,60,0.5); }

.avatar-section-label {
  font-size: 11px; font-weight: 600; color: rgba(61,43,31,0.4);
  letter-spacing: 0.08em; font-family: 'Noto Sans TC', sans-serif;
  margin: 0 0 8px;
}

.avatar-grid {
  display: grid; grid-template-columns: repeat(6, 1fr);
  gap: 6px; margin-bottom: 14px;
}

.avatar-option {
  aspect-ratio: 1; border-radius: 8px; border: 2px solid transparent;
  background: rgba(61,43,31,0.05); font-size: 18px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.15s; line-height: 1;
}
.avatar-option:hover { background: rgba(61,43,31,0.1); transform: scale(1.1); }
.avatar-option.selected { border-color: #3d2b1f; background: rgba(61,43,31,0.08); transform: scale(1.12); }

.confirm-btn {
  width: 100%; padding: 10px; border: none; border-radius: 10px;
  background: #3d2b1f; color: #fdf6ee;
  font-size: 14px; font-weight: 600;
  font-family: 'Noto Sans TC', sans-serif; cursor: pointer;
  transition: background 0.15s;
}
.confirm-btn:hover:not(:disabled) { background: #5c3d28; }
.confirm-btn:disabled { opacity: 0.35; cursor: not-allowed; }

/* Delete panel */
.delete-panel { padding: 16px; min-width: 220px; }

.delete-title {
  font-family: 'Noto Serif TC', serif; font-size: 15px; font-weight: 700;
  color: #3d2b1f; margin: 0 0 12px; text-align: center;
}

.delete-user-preview {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  margin-bottom: 10px;
}
.preview-emoji { font-size: 28px; }
.preview-name { font-size: 15px; color: #3d2b1f; font-family: 'Noto Sans TC', sans-serif; font-weight: 600; }

.delete-msg {
  font-size: 12px; color: rgba(61,43,31,0.55); line-height: 1.6;
  font-family: 'Noto Sans TC', sans-serif; text-align: center; margin: 0 0 14px;
}

.delete-actions { display: flex; gap: 8px; }

.btn-cancel {
  flex: 1; padding: 9px; border: 1.5px solid rgba(180,150,120,0.3);
  border-radius: 10px; background: transparent; color: rgba(61,43,31,0.6);
  font-size: 13px; font-family: 'Noto Sans TC', sans-serif; cursor: pointer;
}
.btn-cancel:hover { background: rgba(61,43,31,0.05); }

.btn-delete {
  flex: 1; padding: 9px; border: none; border-radius: 10px;
  background: #c0392b; color: #fff;
  font-size: 13px; font-weight: 600;
  font-family: 'Noto Sans TC', sans-serif; cursor: pointer;
}
.btn-delete:hover { background: #a93226; }

.dropdown-enter-active, .dropdown-leave-active { transition: all 0.2s cubic-bezier(0.34,1.4,0.64,1); }
.dropdown-enter-from, .dropdown-leave-to { opacity: 0; transform: translateY(-8px) scale(0.96); }
</style>

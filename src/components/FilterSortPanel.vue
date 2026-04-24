<template>
  <button class="filter-trigger" @click="open = !open" :class="{ active: hasActiveFilter }">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="4" y1="6" x2="20" y2="6"/>
      <line x1="8" y1="12" x2="16" y2="12"/>
      <line x1="11" y1="18" x2="13" y2="18"/>
    </svg>
    <span v-if="hasActiveFilter" class="filter-dot" />
  </button>

  <Teleport to="body">
    <Transition name="panel-fade">
      <div v-if="open" class="panel-overlay" @click.self="open = false">
        <div class="panel">
          <div class="panel-header">
            <span class="panel-title">篩選與排序</span>
            <button class="panel-close" @click="open = false">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <!-- Status -->
          <div class="section">
            <p class="section-label">狀態</p>
            <div class="chip-row">
              <button
                v-for="s in statusOptions" :key="s.key"
                class="chip" :class="{ active: local.status === s.key }"
                @click="local.status = s.key"
              >{{ s.label }}</button>
            </div>
          </div>

          <!-- Owner: dropdown select -->
          <div class="section" v-if="owners.length > 0">
            <p class="section-label">擁有者</p>
            <div class="select-wrap">
              <select v-model="local.owner" class="owner-select">
                <option value="">全部擁有者</option>
                <option v-for="u in owners" :key="u.id" :value="u.id">{{ u.avatar }} {{ u.name }}</option>
              </select>
              <svg class="select-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
          </div>

          <!-- Sort: click to toggle key, click again to flip dir -->
          <div class="section">
            <p class="section-label">排序</p>
            <div class="chip-row">
              <button
                v-for="s in sortOptions" :key="s.key"
                class="chip sort-chip" :class="{ active: local.sortKey === s.key }"
                @click="toggleSort(s.key)"
              >
                {{ s.label }}
                <span class="sort-arrow" :class="{ visible: local.sortKey === s.key }">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
                    :style="{ transform: local.sortDir === 'asc' && local.sortKey === s.key ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }"
                  >
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </span>
              </button>
            </div>
            <p class="sort-hint">{{ sortHint }}</p>
          </div>

          <div class="panel-footer">
            <button class="btn-reset" @click="reset">重設</button>
            <button class="btn-apply" @click="apply">套用</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import type { FilterState, FilterStatus, SortKey, User } from '../types'

const props = defineProps<{
  modelValue: FilterState
  owners: User[]
}>()
const emit = defineEmits<{ 'update:modelValue': [v: FilterState] }>()

const open = ref(false)

// Local copy — sync from prop when panel opens
const local = reactive<FilterState>({ ...props.modelValue })
watch(() => props.modelValue, (v) => {
  local.status  = v.status
  local.owner   = v.owner
  local.sortKey = v.sortKey
  local.sortDir = v.sortDir
}, { deep: true })

const hasActiveFilter = computed(() =>
  props.modelValue.status !== 'all' ||
  props.modelValue.owner  !== '' ||
  props.modelValue.sortKey !== 'createdAt' ||
  props.modelValue.sortDir !== 'desc'
)

const statusOptions: { key: FilterStatus; label: string }[] = [
  { key: 'all',        label: '全部' },
  { key: 'incomplete', label: '未集滿' },
  { key: 'complete',   label: '已集滿' },
  { key: 'redeemed',   label: '已兌換' },
]

const sortOptions: { key: SortKey; label: string }[] = [
  { key: 'createdAt', label: '建立日期' },
  { key: 'points',    label: '累積點數' },
]

const sortHint = computed(() => {
  const dir = local.sortDir === 'desc' ? '↓' : '↑'
  const label = local.sortKey === 'createdAt' ? '建立日期' : '累積點數'
  const dirLabel = local.sortDir === 'desc'
    ? (local.sortKey === 'createdAt' ? '最新優先' : '最多優先')
    : (local.sortKey === 'createdAt' ? '最早優先' : '最少優先')
  return `${dir} 依${label}排序・${dirLabel}`
})

function toggleSort(key: SortKey) {
  if (local.sortKey === key) {
    // Same key → flip direction
    local.sortDir = local.sortDir === 'desc' ? 'asc' : 'desc'
  } else {
    // New key → set key, reset to desc
    local.sortKey = key
    local.sortDir = 'desc'
  }
}

function reset() {
  local.status  = 'all'
  local.owner   = ''
  local.sortKey = 'createdAt'
  local.sortDir = 'desc'
  // Immediately emit so list refreshes
  emit('update:modelValue', { ...local })
}

function apply() {
  emit('update:modelValue', { ...local })
  open.value = false
}
</script>

<style scoped>
.filter-trigger {
  position: relative;
  width: 40px; height: 40px;
  border-radius: 50%; border: none;
  background: rgba(61,43,31,0.1); color: #3d2b1f;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: background 0.15s;
}
.filter-trigger svg { width: 18px; height: 18px; }
.filter-trigger:hover, .filter-trigger.active { background: rgba(61,43,31,0.18); }

.filter-dot {
  position: absolute; top: 7px; right: 7px;
  width: 7px; height: 7px; border-radius: 50%;
  background: #d97706; border: 1.5px solid #fdf6ee;
}

.panel-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.3);
  display: flex; align-items: flex-end; justify-content: center;
  z-index: 200;
}

.panel {
  background: #fffaf5;
  border-radius: 24px 24px 0 0;
  padding: 24px 20px 36px;
  width: 100%; max-width: 480px;
  box-shadow: 0 -8px 40px rgba(0,0,0,0.12);
}

.panel-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 22px;
}

.panel-title {
  font-family: 'Noto Serif TC', serif;
  font-size: 17px; font-weight: 700; color: #3d2b1f;
}

.panel-close {
  width: 32px; height: 32px; border-radius: 50%; border: none;
  background: rgba(61,43,31,0.08); color: #3d2b1f;
  display: flex; align-items: center; justify-content: center; cursor: pointer;
}
.panel-close svg { width: 14px; height: 14px; }

.section { margin-bottom: 20px; }

.section-label {
  font-size: 11px; font-weight: 600;
  color: rgba(61,43,31,0.45);
  font-family: 'Noto Sans TC', sans-serif;
  letter-spacing: 0.1em; text-transform: uppercase;
  margin: 0 0 9px;
}

.chip-row { display: flex; flex-wrap: wrap; gap: 8px; }

.chip {
  padding: 8px 16px; border-radius: 20px;
  border: 1.5px solid rgba(180,150,120,0.3);
  background: rgba(255,255,255,0.7);
  color: rgba(61,43,31,0.65);
  font-size: 13px; font-family: 'Noto Sans TC', sans-serif;
  cursor: pointer; transition: all 0.15s;
}
.chip:hover { border-color: rgba(180,120,60,0.4); color: #3d2b1f; }
.chip.active { background: #3d2b1f; color: #fdf6ee; border-color: transparent; }

/* Sort chip with arrow */
.sort-chip {
  display: flex; align-items: center; gap: 6px;
}

.sort-arrow {
  display: flex; align-items: center;
  opacity: 0; width: 0; overflow: hidden;
  transition: opacity 0.2s, width 0.2s;
}
.sort-arrow.visible { opacity: 1; width: 14px; }
.sort-arrow svg { width: 14px; height: 14px; flex-shrink: 0; }
.chip.active .sort-arrow svg { stroke: #fdf6ee; }

.sort-hint {
  margin: 8px 0 0;
  font-size: 12px; color: rgba(61,43,31,0.45);
  font-family: 'Noto Sans TC', sans-serif;
}

/* Owner dropdown */
.select-wrap {
  position: relative; display: inline-flex; align-items: center; width: 100%;
}

.owner-select {
  width: 100%;
  padding: 10px 36px 10px 14px;
  border: 1.5px solid rgba(180,150,120,0.3);
  border-radius: 12px;
  background: rgba(255,255,255,0.8);
  color: #3d2b1f;
  font-size: 14px; font-family: 'Noto Sans TC', sans-serif;
  appearance: none; -webkit-appearance: none;
  outline: none; cursor: pointer;
  transition: border-color 0.15s;
}
.owner-select:focus { border-color: rgba(180,120,60,0.5); }

.select-arrow {
  position: absolute; right: 12px;
  width: 16px; height: 16px;
  color: rgba(61,43,31,0.4); pointer-events: none;
}

.panel-footer { display: flex; gap: 12px; margin-top: 24px; }

.btn-reset {
  flex: 1; padding: 13px;
  border: 1.5px solid rgba(180,150,120,0.3);
  border-radius: 14px; background: transparent;
  color: rgba(61,43,31,0.6);
  font-size: 14px; font-family: 'Noto Sans TC', sans-serif; cursor: pointer;
}
.btn-reset:hover { background: rgba(61,43,31,0.05); }

.btn-apply {
  flex: 2; padding: 13px; border: none; border-radius: 14px;
  background: #3d2b1f; color: #fdf6ee;
  font-size: 14px; font-weight: 600;
  font-family: 'Noto Sans TC', sans-serif; cursor: pointer;
}
.btn-apply:hover { background: #5c3d28; }

.panel-fade-enter-active, .panel-fade-leave-active { transition: opacity 0.25s; }
.panel-fade-enter-active .panel, .panel-fade-leave-active .panel { transition: transform 0.3s cubic-bezier(0.34,1.4,0.64,1); }
.panel-fade-enter-from, .panel-fade-leave-to { opacity: 0; }
.panel-fade-enter-from .panel, .panel-fade-leave-to .panel { transform: translateY(100%); }
</style>

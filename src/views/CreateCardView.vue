<template>
  <div class="create-page">
    <div class="bg-texture" />

    <header class="create-header">
      <button class="back-btn" @click="router.back()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
      <h1 class="header-title">新增集點卡</h1>
      <div style="width:40px" />
    </header>

    <main class="create-body">
      <!-- Preview card -->
      <div class="preview-wrap">
        <div class="preview-card" :class="`color-${selectedColor}`">
          <div class="preview-top">
            <span class="preview-name">{{ form.name || '集點卡名稱' }}</span>
            <span class="preview-date">{{ today }}</span>
          </div>
          <div class="preview-owner">{{ form.owner || '擁有者' }}</div>
          <div class="preview-dots">
            <span v-for="i in (form.maxPoints || 10)" :key="i" class="dot" />
          </div>
          <div class="preview-count">0 / {{ form.maxPoints || 10 }} 點</div>
        </div>
      </div>

      <!-- Color picker -->
      <div class="field-group">
        <label class="field-label">卡片顏色</label>
        <div class="color-row">
          <button
            v-for="c in colors"
            :key="c.key"
            class="color-swatch"
            :class="[`swatch-${c.key}`, { active: selectedColor === c.key }]"
            @click="selectedColor = c.key"
            :title="c.label"
          />
        </div>
      </div>

      <!-- Name -->
      <div class="field-group">
        <label class="field-label" for="card-name">集點卡名稱</label>
        <input id="card-name" v-model="form.name" class="field-input" type="text" placeholder="例如：珍珠奶茶卡" maxlength="20" />
        <span class="field-hint">{{ form.name.length }} / 20</span>
      </div>

      <!-- Owner -->
      <div class="field-group">
        <label class="field-label" for="card-owner">擁有者名稱</label>
        <input id="card-owner" v-model="form.owner" class="field-input" type="text" placeholder="例如：小明" maxlength="20" />
      </div>

      <!-- Description -->
      <div class="field-group">
        <label class="field-label" for="card-desc">描述</label>
        <textarea
          id="card-desc"
          v-model="form.description"
          class="field-input field-textarea"
          placeholder="說明集點規則或兌換方式…"
          maxlength="100"
          rows="3"
        />
        <span class="field-hint">{{ form.description.length }} / 100</span>
      </div>

      <!-- Points slider -->
      <div class="field-group">
        <label class="field-label">
          點數上限
          <span class="pts-inline-val">{{ form.maxPoints }} 點</span>
        </label>
        <input
          type="range"
          min="1"
          max="30"
          step="1"
          v-model.number="form.maxPoints"
          class="pts-slider"
        />
        <div class="pts-range-labels">
          <span>1</span>
          <span>10</span>
          <span>20</span>
          <span>30</span>
        </div>
      </div>

      <!-- Submit -->
      <button class="create-btn" :disabled="!form.name.trim()" @click="submit">
        建立集點卡
      </button>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useCardStore } from '../stores/cardStore'
import type { CardColor } from '../types'

const router = useRouter()
const store = useCardStore()
const today = new Date().toISOString().split('T')[0]

const form = reactive({
  name: '',
  owner: '',
  description: '',
  maxPoints: 10,
})

const selectedColor = ref<CardColor>('peach')

const colors: { key: CardColor; label: string }[] = [
  { key: 'peach',    label: '桃子' },
  { key: 'mint',     label: '薄荷' },
  { key: 'lavender', label: '薰衣草' },
  { key: 'butter',   label: '奶油' },
  { key: 'sky',      label: '天空' },
]

function submit() {
  if (!form.name.trim()) return
  const card = store.createCard(form.name.trim(), form.maxPoints, form.owner.trim(), form.description.trim())
  card.color = selectedColor.value
  router.replace(`/card/${card.id}`)
}
</script>

<style scoped>
.create-page {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: #fdf6ee;
  position: relative;
  overflow-x: hidden;
}

.bg-texture {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at 90% 5%, rgba(253,200,170,0.2) 0%, transparent 40%),
    radial-gradient(circle at 10% 90%, rgba(200,230,210,0.2) 0%, transparent 40%);
  pointer-events: none;
}

.create-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 20px 0;
  position: relative;
  z-index: 5;
}

.back-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: rgba(61,43,31,0.1);
  color: #3d2b1f;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s;
}
.back-btn svg { width: 18px; height: 18px; }
.back-btn:hover { background: rgba(61,43,31,0.18); }

.header-title {
  font-family: 'Noto Serif TC', serif;
  font-size: 18px;
  font-weight: 700;
  color: #3d2b1f;
  margin: 0;
}

.create-body {
  flex: 1;
  padding: 24px 20px 48px;
  display: flex;
  flex-direction: column;
  gap: 22px;
  position: relative;
  z-index: 5;
  max-width: 480px;
  width: 100%;
  margin: 0 auto;
}

/* Preview */
.preview-wrap { display: flex; justify-content: center; }

.preview-card {
  width: 100%;
  max-width: 320px;
  min-height: 150px;
  border-radius: 20px;
  padding: 20px;
  box-sizing: border-box;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: background 0.3s ease;
}

.color-peach   { background: linear-gradient(135deg, #fde8d8 0%, #f9c4a4 100%); }
.color-mint    { background: linear-gradient(135deg, #d4f5e9 0%, #a7eacf 100%); }
.color-lavender{ background: linear-gradient(135deg, #ede8fb 0%, #d5c8f7 100%); }
.color-butter  { background: linear-gradient(135deg, #fdf6c3 0%, #f9e87a 100%); }
.color-sky     { background: linear-gradient(135deg, #dcf0fb 0%, #a8d8f5 100%); }

.preview-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.preview-name {
  font-family: 'Noto Serif TC', serif;
  font-size: 15px;
  font-weight: 700;
  color: #3d2b1f;
}
.preview-date {
  font-size: 10px;
  color: rgba(61,43,31,0.5);
  font-family: 'Noto Sans TC', sans-serif;
}
.preview-owner {
  font-size: 12px;
  color: rgba(61,43,31,0.6);
  font-family: 'Noto Sans TC', sans-serif;
}
.preview-dots {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  flex: 1;
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255,255,255,0.5);
  border: 1px solid rgba(180,150,120,0.3);
}
.preview-count {
  font-size: 11px;
  color: rgba(61,43,31,0.5);
  text-align: right;
  font-family: 'Noto Sans TC', sans-serif;
}

/* Fields */
.field-group { display: flex; flex-direction: column; gap: 8px; }

.field-label {
  font-family: 'Noto Serif TC', serif;
  font-size: 14px;
  font-weight: 600;
  color: #3d2b1f;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.pts-inline-val {
  font-family: 'Noto Serif TC', serif;
  font-size: 20px;
  font-weight: 700;
  color: #d97706;
}

.field-input {
  padding: 13px 16px;
  border: 1.5px solid rgba(180,150,120,0.3);
  border-radius: 14px;
  background: rgba(255,255,255,0.8);
  font-family: 'Noto Sans TC', sans-serif;
  font-size: 15px;
  color: #3d2b1f;
  outline: none;
  transition: border-color 0.2s;
  resize: none;
}
.field-input::placeholder { color: rgba(61,43,31,0.35); }
.field-input:focus { border-color: rgba(180,120,60,0.5); }
.field-textarea { line-height: 1.6; }

.field-hint {
  font-size: 11px;
  color: rgba(61,43,31,0.4);
  text-align: right;
  font-family: 'Noto Sans TC', sans-serif;
}

/* Color swatches */
.color-row { display: flex; gap: 10px; }
.color-swatch {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2.5px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}
.color-swatch.active { border-color: #3d2b1f; transform: scale(1.18); }
.swatch-peach    { background: #f9c4a4; }
.swatch-mint     { background: #a7eacf; }
.swatch-lavender { background: #d5c8f7; }
.swatch-butter   { background: #f9e87a; }
.swatch-sky      { background: #a8d8f5; }

/* Slider */
.pts-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: linear-gradient(
    to right,
    #d97706 0%,
    #d97706 calc((var(--val, 10) - 1) / 29 * 100%),
    rgba(180,150,120,0.25) calc((var(--val, 10) - 1) / 29 * 100%),
    rgba(180,150,120,0.25) 100%
  );
  outline: none;
  cursor: pointer;
}

.pts-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #3d2b1f;
  border: 3px solid #fdf6ee;
  box-shadow: 0 2px 10px rgba(61,43,31,0.3);
  cursor: pointer;
  transition: transform 0.15s;
}
.pts-slider::-webkit-slider-thumb:hover { transform: scale(1.15); }
.pts-slider::-moz-range-thumb {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #3d2b1f;
  border: 3px solid #fdf6ee;
  box-shadow: 0 2px 10px rgba(61,43,31,0.3);
  cursor: pointer;
}

.pts-range-labels {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: rgba(61,43,31,0.4);
  font-family: 'Noto Sans TC', sans-serif;
}

/* Submit */
.create-btn {
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 18px;
  background: #3d2b1f;
  color: #fdf6ee;
  font-family: 'Noto Serif TC', serif;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.05em;
  cursor: pointer;
  box-shadow: 0 6px 24px rgba(61,43,31,0.2);
  transition: all 0.2s ease;
  margin-top: 8px;
}
.create-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(61,43,31,0.28); }
.create-btn:disabled { opacity: 0.4; cursor: not-allowed; }
</style>

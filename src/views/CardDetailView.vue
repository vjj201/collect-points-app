<template>
  <div class="detail-page" :class="`color-${card?.color}`">
    <div class="bg-texture" />

    <header class="detail-header">
      <button class="back-btn" @click="router.back()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
      <div class="header-center">
        <span class="status-badge" :class="cardStatus">{{ statusLabel }}</span>
      </div>
      <div class="header-right-group">
        <div class="points-badge">{{ currentPoints }} / {{ card?.maxPoints }}</div>
        <UserSwitcher
          :current-user-id="store.currentUserId"
          :current-user="store.currentUser"
          :users="store.users"
          @update:current-user-id="store.currentUserId = $event"
          @addUser="store.addUser($event.name, $event.avatar)"
          @deleteUser="store.deleteUser($event)"
        />
      </div>
    </header>

    <main class="card-body" v-if="card">
      <div class="layout-wrap">
        <div class="card-panel">
          <div class="card-title-row">
            <div class="card-title-left">
              <h2 class="card-name">{{ card.name }}</h2>
              <p class="card-owner">
                <template v-if="ownerUser">
                  <span class="owner-avatar">{{ ownerUser.avatar }}</span> {{ ownerUser.name }}
                </template>
                <template v-else>未設定擁有者</template>
              </p>
            </div>
            <div class="card-meta">
              <span class="meta-label">建立日期</span>
              <span class="meta-value">{{ card.createdAt }}</span>
              <template v-if="card.redeemedAt">
                <span class="meta-label" style="margin-top:6px">兌換日期</span>
                <span class="meta-value redeemed-date">{{ card.redeemedAt }}</span>
              </template>
            </div>
          </div>

          <p v-if="card.description" class="card-description wide-only">{{ card.description }}</p>
          <div class="panel-divider" />

          <!-- Stamp grid with redeemed overlay -->
          <div class="grid-wrap">
            <StampGrid
              :slots="slots"
              :just-stamped-index="justStampedIndex"
              :just-erased-index="justErasedIndex"
            />
            <!-- Redeemed overlay -->
            <Transition name="redeem-fade">
              <div v-if="cardStatus === 'redeemed'" class="redeemed-overlay">
                <div class="redeemed-seal">
                  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="40" cy="40" r="36" stroke="#b45309" stroke-width="3" stroke-dasharray="6 3"/>
                    <circle cx="40" cy="40" r="28" stroke="#b45309" stroke-width="1.5"/>
                    <text x="40" y="37" text-anchor="middle" font-size="11" font-family="Noto Serif TC, serif" fill="#b45309" font-weight="700">已兌換</text>
                    <text x="40" y="52" text-anchor="middle" font-size="8" font-family="Noto Sans TC, sans-serif" fill="#b45309">{{ card.redeemedAt }}</text>
                  </svg>
                </div>
              </div>
            </Transition>
          </div>

          <p v-if="card.description" class="card-description narrow-only">{{ card.description }}</p>

          <!-- Complete banner (not yet redeemed) -->
          <Transition name="complete-fade">
            <div v-if="cardStatus === 'complete'" class="complete-banner">
              🎉 集點完成！按下兌換即可使用
            </div>
          </Transition>
        </div>
      </div>
    </main>

    <!-- Action bar -->
    <div class="action-bar">
      <div class="action-inner">
        <!-- Erase: only show when not redeemed -->
        <button
          v-if="cardStatus !== 'redeemed'"
          class="action-btn erase-btn"
          :disabled="currentPoints <= 0"
          @click="erase"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
          <span>消除</span>
        </button>

        <!-- Stamp: only when incomplete -->
        <button
          v-if="cardStatus === 'incomplete'"
          class="action-btn stamp-btn"
          @click="showPicker = true"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          <span>蓋章</span>
        </button>

        <!-- Redeem: when complete (not yet redeemed) -->
        <button
          v-if="cardStatus === 'complete'"
          class="action-btn redeem-btn"
          @click="confirmRedeem = true"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 12V22H4V12"/>
            <path d="M22 7H2v5h20V7z"/>
            <path d="M12 22V7"/>
            <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/>
            <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/>
          </svg>
          <span>立即兌換</span>
        </button>

        <!-- Already redeemed state -->
        <div v-if="cardStatus === 'redeemed'" class="redeemed-action-msg">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          已於 {{ card?.redeemedAt }} 兌換完畢
        </div>
      </div>
    </div>

    <StampPicker :show="showPicker" @confirm="onStampConfirm" @cancel="showPicker = false" />

    <!-- Redeem confirm -->
    <ConfirmDialog
      :show="confirmRedeem"
      title="確認兌換"
      :message="`確定要兌換「${card?.name ?? ''}」嗎？\n兌換後將無法繼續蓋章。`"
      confirm-label="兌換"
      @confirm="doRedeem"
      @cancel="confirmRedeem = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCardStore } from '../stores/cardStore'
import StampGrid from '../components/StampGrid.vue'
import StampPicker from '../components/StampPicker.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import UserSwitcher from '../components/UserSwitcher.vue'
import type { StampIcon } from '../types'

const route = useRoute()
const router = useRouter()
const store = useCardStore()

const cardId = route.params.id as string
const card = computed(() => store.cards.find(c => c.id === cardId) ?? null)
const slots = computed(() => store.getCardSlots(cardId))
const currentPoints = computed(() => store.getCardPoints(cardId))
const cardStatus = computed(() => store.getCardStatus(cardId))
const ownerUser = computed(() => card.value ? store.getUserById(card.value.owner) : undefined)

const statusLabel = computed(() => {
  switch (cardStatus.value) {
    case 'redeemed':   return '已兌換'
    case 'complete':   return '已集滿'
    case 'incomplete': return `${currentPoints.value} / ${card.value?.maxPoints} 點`
  }
})

const showPicker = ref(false)
const confirmRedeem = ref(false)
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

function doRedeem() {
  store.redeemCard(cardId)
  confirmRedeem.value = false
}
</script>

<style scoped>
.detail-page {
  height: 100dvh;
  display: flex; flex-direction: column;
  position: relative; overflow: hidden;
}

.color-peach   { background: #fde8d8; }
.color-mint    { background: #d4f5e9; }
.color-lavender{ background: #ede8fb; }
.color-butter  { background: #fdf6c3; }
.color-sky     { background: #dcf0fb; }

.bg-texture {
  position: absolute; inset: 0;
  background-image: radial-gradient(circle at 80% 10%, rgba(255,255,255,0.5) 0%, transparent 50%);
  pointer-events: none;
}

.detail-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 20px 20px 0; position: relative; z-index: 10; flex-shrink: 0;
}

.back-btn {
  width: 40px; height: 40px; border-radius: 50%; border: none;
  background: rgba(61,43,31,0.12); color: #3d2b1f;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: background 0.15s; flex-shrink: 0;
}
.back-btn svg { width: 18px; height: 18px; }
.back-btn:hover { background: rgba(61,43,31,0.2); }

.header-center { flex: 1; display: flex; justify-content: center; }

.status-badge {
  padding: 5px 14px; border-radius: 20px;
  font-family: 'Noto Sans TC', sans-serif;
  font-size: 13px; font-weight: 600;
}
.status-badge.incomplete { background: rgba(61,43,31,0.1); color: rgba(61,43,31,0.7); }
.status-badge.complete   { background: rgba(251,191,36,0.25); color: #92400e; }
.status-badge.redeemed   { background: rgba(180,83,9,0.15); color: #92400e; }

.header-right-group {
  display: flex; align-items: center; gap: 8px; flex-shrink: 0;
}

.points-badge {
  background: rgba(61,43,31,0.12); color: #3d2b1f;
  font-family: 'Noto Serif TC', serif; font-size: 13px; font-weight: 600;
  padding: 5px 14px; border-radius: 20px; flex-shrink: 0;
}

.card-body {
  flex: 1; min-height: 0;
  display: flex; align-items: flex-start; justify-content: center;
  padding: 16px 20px; position: relative; z-index: 5;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.layout-wrap { width: 100%; max-width: 680px; padding-bottom: 8px; }

.card-panel {
  background: rgba(255,255,255,0.72);
  backdrop-filter: blur(14px);
  border-radius: 24px; padding: 24px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.08), 0 0 0 1px rgba(255,255,255,0.85);
}

.card-title-row {
  display: flex; justify-content: space-between; align-items: flex-start;
  margin-bottom: 14px;
}
.card-title-left { display: flex; flex-direction: column; gap: 3px; }
.card-name {
  font-family: 'Noto Serif TC', serif; font-size: 22px; font-weight: 700;
  color: #3d2b1f; margin: 0;
}
.card-owner { font-size: 13px; color: rgba(61,43,31,0.55); margin: 0; font-family: 'Noto Sans TC', sans-serif; display: flex; align-items: center; gap: 4px; }
.owner-avatar { font-size: 16px; line-height: 1; }

.card-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
.meta-label { font-size: 10px; color: rgba(61,43,31,0.4); font-family: 'Noto Sans TC', sans-serif; }
.meta-value { font-size: 12px; color: rgba(61,43,31,0.65); font-family: 'Noto Sans TC', sans-serif; }
.redeemed-date { color: #b45309; font-weight: 600; }

.card-description {
  font-size: 13px; color: rgba(61,43,31,0.65);
  font-family: 'Noto Sans TC', sans-serif;
  line-height: 1.7; margin: 0 0 14px;
}
.panel-divider { height: 1px; background: rgba(180,150,120,0.2); margin: 0 0 18px; }

/* Grid wrap with overlay */
.grid-wrap { position: relative; }

.redeemed-overlay {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  background: rgba(255,250,245,0.55);
  border-radius: 12px;
  backdrop-filter: blur(2px);
}

.redeemed-seal svg { width: 100px; height: 100px; filter: drop-shadow(0 2px 8px rgba(180,83,9,0.2)); }

.complete-banner {
  margin-top: 16px; text-align: center;
  font-family: 'Noto Serif TC', serif; font-size: 15px; font-weight: 700;
  color: #92400e; background: rgba(251,191,36,0.2);
  border-radius: 12px; padding: 12px;
  border: 1.5px dashed rgba(251,191,36,0.5);
}

.wide-only { display: none; }
.narrow-only { display: block; margin-top: 14px; }
@media (min-width: 600px) {
  .wide-only { display: block; }
  .narrow-only { display: none; }
  .card-name { font-size: 26px; }
  .card-panel { padding: 32px; }
}

/* Action bar */
.action-bar {
  flex-shrink: 0;
  padding: 12px 20px 28px; position: relative; z-index: 10;
  display: flex; justify-content: center;
}

.action-inner {
  display: flex; gap: 12px;
  width: 100%; max-width: 480px; align-items: center;
}

.action-btn {
  display: flex; align-items: center; justify-content: center; gap: 7px;
  padding: 14px 18px; border: none; border-radius: 16px;
  font-size: 15px; font-family: 'Noto Serif TC', serif; font-weight: 600;
  cursor: pointer; transition: all 0.2s ease;
  box-shadow: 0 4px 14px rgba(0,0,0,0.09);
  white-space: nowrap;
}
.action-btn svg { width: 17px; height: 17px; flex-shrink: 0; }
.action-btn:disabled { opacity: 0.32; cursor: not-allowed; transform: none !important; box-shadow: none; }

.erase-btn {
  flex: 0 0 auto; min-width: 90px;
  background: rgba(255,255,255,0.72); color: #7c3d1a;
  border: 1.5px solid rgba(180,150,120,0.3);
}
.erase-btn:hover:not(:disabled) { background: rgba(255,255,255,0.92); transform: translateY(-2px); }

.stamp-btn {
  flex: 1; max-width: 260px;
  background: #3d2b1f; color: #fdf6ee;
}
.stamp-btn:hover:not(:disabled) { background: #5c3d28; transform: translateY(-2px); }

.redeem-btn {
  flex: 1; max-width: 260px;
  background: linear-gradient(135deg, #d97706, #b45309);
  color: #fff;
  box-shadow: 0 4px 16px rgba(180,83,9,0.3);
}
.redeem-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(180,83,9,0.4); }

.redeemed-action-msg {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 14px; border-radius: 16px;
  background: rgba(255,255,255,0.5);
  border: 1.5px solid rgba(180,120,9,0.2);
  color: #92400e; font-size: 14px;
  font-family: 'Noto Sans TC', sans-serif;
}

/* Animations */
.complete-fade-enter-active { animation: bounce-in 0.5s cubic-bezier(0.34,1.56,0.64,1); }
@keyframes bounce-in { from { transform: scale(0.7); opacity: 0; } to { transform: scale(1); opacity: 1; } }

.redeem-fade-enter-active { animation: seal-in 0.6s cubic-bezier(0.34,1.4,0.64,1); }
@keyframes seal-in { from { opacity: 0; transform: scale(0.5) rotate(-20deg); } to { opacity: 1; transform: scale(1) rotate(-8deg); } }
</style>

<template>
  <div class="home">
    <div class="bg-texture" />

    <header class="home-header">
      <h1 class="title">集點卡</h1>
      <div class="header-right">
        <FilterSortPanel :model-value="filter" :owners="store.allOwners" @update:model-value="onFilterUpdate" />
        <UserSwitcher
          :current-user-id="store.currentUserId"
          :current-user="store.currentUser"
          :users="store.users"
          @update:current-user-id="store.currentUserId = $event"
          @addUser="store.addUser($event.name, $event.avatar)"
          @deleteUser="store.deleteUser($event)"
        />
        <button class="add-btn" @click="router.push('/create')" title="新增集點卡">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      </div>
    </header>

    <!-- Empty state -->
    <div v-if="displayCards.length === 0" class="empty-state">
      <div class="empty-icon">🗂️</div>
      <p class="empty-title">沒有符合的集點卡</p>
      <p class="empty-sub">調整篩選條件或新增集點卡</p>
    </div>

    <!-- Carousel -->
    <main v-else class="carousel-area">
      <CardCarousel
        :key="carouselKey"
        :cards="displayCards"
        @select="onSelect"
      />
    </main>

    <footer class="home-footer">
      <div class="footer-btns">
        <button
          class="delete-btn"
          :disabled="!selectedDisplayCard"
          @click="confirmDelete = true"
          title="刪除集點卡"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14H6L5 6"/>
            <path d="M10 11v6M14 11v6"/>
            <path d="M9 6V4h6v2"/>
          </svg>
        </button>

        <button
          class="enter-btn"
          @click="enterCard"
          :disabled="!selectedDisplayCard"
        >
          查看
        </button>
      </div>
      <p class="swipe-hint">{{ isWide ? '← → 滑動切換' : '↕ 滑動切換' }}</p>
    </footer>

    <!-- Delete confirm -->
    <ConfirmDialog
      :show="confirmDelete"
      title="刪除集點卡"
      :message="`確定要刪除「${selectedDisplayCard?.name ?? ''}」嗎？此操作無法還原。`"
      confirm-label="刪除"
      @confirm="doDelete"
      @cancel="confirmDelete = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCardStore } from '../stores/cardStore'
import CardCarousel from '../components/CardCarousel.vue'
import FilterSortPanel from '../components/FilterSortPanel.vue'
import UserSwitcher from '../components/UserSwitcher.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import type { FilterState } from '../types'

const router = useRouter()
const store = useCardStore()

const isWide = ref(window.innerWidth >= 768)
const confirmDelete = ref(false)
const carouselKey = ref(0)  // increment to reset carousel activeIndex

const filter = reactive<FilterState>({
  status: 'all', owner: '', sortKey: 'createdAt', sortDir: 'desc',
})

// v-model handler: mutate in-place so computed re-runs correctly
function onFilterUpdate(newFilter: FilterState) {
  filter.status  = newFilter.status
  filter.owner   = newFilter.owner
  filter.sortKey = newFilter.sortKey
  filter.sortDir = newFilter.sortDir
  carouselKey.value++  // reset carousel position
}

// Extra users (beyond card owners) — now managed in store directly
const allUsers = computed(() => store.users)

const displayCards = computed(() => store.filteredAndSorted(filter))

const selectedDisplayCard = computed(() =>
  displayCards.value.find(c => c.id === store.selectedCardId) ?? displayCards.value[0] ?? null
)

function onSelect(id: string) { store.selectedCardId = id }

function enterCard() {
  const card = selectedDisplayCard.value
  if (card) router.push(`/card/${card.id}`)
}

function doDelete() {
  const card = selectedDisplayCard.value
  if (card) store.deleteCard(card.id)
  confirmDelete.value = false
}

function onResize() { isWide.value = window.innerWidth >= 768 }
onMounted(() => window.addEventListener('resize', onResize))
onUnmounted(() => window.removeEventListener('resize', onResize))
</script>

<style scoped>
.home {
  height: 100dvh;
  display: flex;
  flex-direction: column;
  background: #fdf6ee;
  position: relative;
  overflow: hidden;
}

.bg-texture {
  position: absolute; inset: 0;
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
  padding: 20px 20px 0;
  position: relative; z-index: 10;
  flex-shrink: 0;
}

.title {
  font-family: 'Noto Serif TC', serif;
  font-size: 26px; font-weight: 700;
  color: #3d2b1f; margin: 0;
  letter-spacing: 0.04em;
}

.header-right {
  display: flex; align-items: center; gap: 8px;
}

.add-btn {
  width: 40px; height: 40px;
  border-radius: 50%; border: none;
  background: #3d2b1f; color: #fdf6ee;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(61,43,31,0.22);
  transition: all 0.2s ease;
}
.add-btn svg { width: 18px; height: 18px; }
.add-btn:hover { transform: scale(1.1) rotate(90deg); background: #5c3d28; }

/* Empty state */
.empty-state {
  flex: 1;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 8px; padding: 40px;
}
.empty-icon { font-size: 48px; }
.empty-title {
  font-family: 'Noto Serif TC', serif;
  font-size: 17px; font-weight: 600; color: #3d2b1f; margin: 0;
}
.empty-sub {
  font-size: 13px; color: rgba(61,43,31,0.5);
  font-family: 'Noto Sans TC', sans-serif; margin: 0;
}

/* Carousel fills all remaining space */
.carousel-area {
  flex: 1;
  min-height: 0;       /* crucial: lets flex child shrink below content size */
  position: relative;
  overflow: hidden;
}

.home-footer {
  flex-shrink: 0;
  padding: 14px 20px 28px;
  display: flex; flex-direction: column;
  align-items: center; gap: 8px;
  position: relative; z-index: 10;
}

.footer-btns {
  display: flex; gap: 10px;
  width: 100%; max-width: 320px;
  align-items: center;
}

.delete-btn {
  width: 48px; height: 48px;
  border-radius: 14px;
  border: 1.5px solid rgba(180,150,120,0.3);
  background: rgba(255,255,255,0.7);
  color: rgba(180,60,40,0.7);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; flex-shrink: 0;
  transition: all 0.18s;
}
.delete-btn svg { width: 18px; height: 18px; }
.delete-btn:hover:not(:disabled) { background: rgba(255,235,230,0.9); color: #c0392b; border-color: rgba(192,57,43,0.3); }
.delete-btn:disabled { opacity: 0.3; cursor: not-allowed; }

.enter-btn {
  flex: 1;
  padding: 14px;
  border: none; border-radius: 16px;
  background: #3d2b1f; color: #fdf6ee;
  font-family: 'Noto Serif TC', serif;
  font-size: 16px; font-weight: 600;
  letter-spacing: 0.1em; cursor: pointer;
  box-shadow: 0 5px 20px rgba(61,43,31,0.2);
  transition: all 0.2s ease;
}
.enter-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(61,43,31,0.27); }
.enter-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.swipe-hint {
  font-size: 12px; color: rgba(61,43,31,0.4);
  margin: 0; font-family: 'Noto Sans TC', sans-serif;
}
</style>

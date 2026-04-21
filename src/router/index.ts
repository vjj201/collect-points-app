import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CardDetailView from '../views/CardDetailView.vue'
import CreateCardView from '../views/CreateCardView.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/card/:id', name: 'card-detail', component: CardDetailView },
    { path: '/create', name: 'create-card', component: CreateCardView },
  ],
})

export default router

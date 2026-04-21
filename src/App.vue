<template>
  <RouterView v-slot="{ Component }">
    <Transition name="page" mode="out-in">
      <component :is="Component" />
    </Transition>
  </RouterView>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;600;700&family=Noto+Sans+TC:wght@400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html, body {
  height: 100%;
  -webkit-tap-highlight-color: transparent;
}

#app {
  height: 100%;
  min-height: 100dvh;
}

.page-enter-active, .page-leave-active {
  transition: all 0.28s ease;
}
.page-enter-from { opacity: 0; transform: translateX(24px); }
.page-leave-to   { opacity: 0; transform: translateX(-24px); }
</style>

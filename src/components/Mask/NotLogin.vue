<template>
  <div class="mask" v-if="props.isShowMask">
    <p>
      您还未登陆，请先<NuxtLink class="loginLink" to="/login">登陆</NuxtLink>
    </p>
  </div>
</template>

<script setup>
const props = defineProps({
  isShowMask: {
    type: Boolean,
    default: true,
  },
});
</script>

<style scoped>
.mask {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 9;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: rgb(255 255 255 / 60%);
}
.mask .loginLink {
  color: var(--link-color);
}
</style>

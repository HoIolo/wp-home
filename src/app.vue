<template>
  <PageLoading
    v-if="isShowLoading"
    :completeHandle="completeHandle"
    :isComplete="isComplete"
  ></PageLoading>
  <div id="app">
    <NuxtPage
      class="nuxt_page"
      :class="{ loadingComplete: isComplete, cancleOverflow: isCancleOverflow }"
    ></NuxtPage>
  </div>
</template>

<script setup lang="ts">
import nprogress from "nprogress";
import "animate.css";
import { postIncrementVisitorCount } from "~/api/websiteApi";

const isShowLoading = ref(true);

const nuxtApp = useNuxtApp();

const router = useRouter();

nprogress.configure({
  easing: "ease", // 动画方式
  speed: 500, // 递增进度条的速度
  showSpinner: false, // 是否显示加载ico
  trickleSpeed: 200, // 自动递增间隔
  minimum: 0.3, // 初始化时的最小百分比
});
const completeHandle = () => {
  isShowLoading.value = false;
};

const userState = await useUserState();

await keepUserData(userState);

nuxtApp.hook("page:start", () => {
  nprogress.start();
});
const isComplete = ref(false);
provide("isLoadingComplete", isComplete);
const isCancleOverflow = ref(false);

nuxtApp.hook("page:finish", () => {
  nprogress.done();
  if (process.client) {
    window.scrollTo(0, 0);
  }
});

router.beforeEach(async (to, from, next) => {
  next();
});
onMounted(() => {
  setTimeout(() => {
    document.body.classList.add("pageLoadingComplete");
    isComplete.value = true;

    // 记录网站访问次数
    postIncrementVisitorCount({
      date: new Date().toISOString().split("T")[0],
      count: 1,
    });
  }, 1500);
  setTimeout(() => {
    // 防止滚动条出现
    isCancleOverflow.value = true;
  }, 3000);
});
</script>

<style>
@import url("@/assets/css/base.css");
@import url("@/assets/font/iconfont.css");
@import url("@/assets/font/font.css");
@import url("@/assets/font/tsxmm/font.css");
@import "element-plus/dist/index.css";
@import "nprogress/nprogress.css";

.pageLoadingComplete {
  overflow: auto;
}
.nuxt_page {
  filter: blur(100px);
  overflow: hidden;
  transform: translateZ(0);
  transition: filter 1s linear;
}

.loadingComplete {
  filter: none;
  transform: none;
}

.cancleOverflow {
  overflow: unset;
}

/* showContent */
.showContent {
  padding-top: 85.05px;
}

.menu {
  display: inline-block;
}

.menu::after {
  content: "";
  position: relative;
  bottom: 15px;
  display: block;
  width: 0rem;
  height: 5px;
  margin: 0 auto;
  background-color: orange;
  transition: 1s all cubic-bezier(0.46, 1, 0.23, 1);
}

.menu:hover::after {
  width: 5rem;
}

.container {
  display: flex;
  justify-content: center;
  /* padding: 50px 0; */
  padding: var(--mtop) 0;
  /* background-image: url('assets/img/kyotoanimation.png'); */
}
</style>

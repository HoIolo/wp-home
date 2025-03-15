<template>
  <div
    class="head"
    ref="tabBar"
    :class="{
      stickTop: isStickTop,
      forceStatic: stickTop,
      loginAndRegister: $route.path == '/login' || $route.path == '/register',
    }"
  >
    <div class="logo">
      <nuxt-link to="/">{{ props.logoText }}</nuxt-link>
    </div>
    <div class="menuBtn hide" @click="showMiniMenu">
      <svg
        viewBox="0 0 24 24"
        width="24"
        height="24"
        stroke="currentColor"
        stroke-width="2"
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>
    </div>
    <div class="menus" :class="{ miniMenuShow: isShowMiniMenu }">
      <div class="closed hide" @click="closeMiniMenu">
        <svg
          viewBox="0 0 24 24"
          width="24"
          height="24"
          stroke="currentColor"
          stroke-width="2"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </div>
      <slot>
        <div class="logo">
          <h1>小析的Blog</h1>
        </div>
      </slot>
      <div class="menu" v-for="(item, index) in props.menus" :key="index">
        <nuxt-link
          class="menu-link"
          v-if="isEmpty(item.childMenus)"
          :to="item.path"
          ><span class="iconfont" v-html="item.icon"></span
          >{{ item.title }}</nuxt-link
        >
        <el-dropdown v-else @visible-change="handleVisibleChange">
          <!-- 二级菜单 -->
          <span class="el-dropdown-link">
            <span class="iconfont" v-html="item.icon"></span>
            {{ item.title }}
            <el-icon class="el-icon--right">
              <el-icon-arrow-down />
            </el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-for="childItem in item.childMenus">
                <nuxt-link :to="childItem.path">
                  <span class="iconfont" v-html="childItem.icon"></span>
                  {{ childItem.title }}</nuxt-link
                >
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    <div class="other">
      <div class="search" @click="toggleSearch">
        <span class="iconfont" title="搜索一下吧~">&#xe67d;</span>
      </div>
      <div class="user">
        <nuxt-link to="/login" v-if="!userData">
          <client-only>
            <el-tooltip
              content="您还未登录，点击登录"
              placement="bottom"
              effect="light"
            >
              <span class="iconfont" title="您还未登录，点击登录"
                >&#xe640;</span
              >
            </el-tooltip>
          </client-only>
        </nuxt-link>
        <nuxt-link to="/account" v-else title="点击进入用户管理页面">
          <client-only>
            <el-tooltip
              content="点击进入用户管理页面"
              placement="bottom"
              effect="light"
            >
              <img
                :src="
                  transformUpYunPicUrl({
                    url: userData.avatar,
                    options: { width: 42, quality: 90 },
                  })
                "
                alt=""
              />
            </el-tooltip>
          </client-only>
        </nuxt-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { isEmpty } from "undraw-ui";
import type { UserStateType } from "~/types/user";

type MenuType = {
  title: string;
  icon?: string;
  path?: string;
  childMenus?: MenuType[];
};

interface tabProps {
  menus: Array<MenuType>;
  user?: UserStateType;
  stickTop?: boolean;
  logoText?: string;
}
const props = defineProps<tabProps>();

let scroll = ref<number>();

const handleVisibleChange = (val: boolean) => {
  if (scroll.value > 10) return;
  isStickTop.value = val;
};

const emit = defineEmits(["toggleSearch"]);

let currentIndex = ref<number>(0);
let isStickTop = ref<boolean>(props.stickTop || false);
let isShowMiniMenu = ref<boolean>(false);

const userData = await useUserState();

function activeClick(index: any) {
  currentIndex.value = index;
}

function toggleSearch() {
  emit("toggleSearch", true);
}

function showMiniMenu() {
  isShowMiniMenu.value = true;
}

function closeMiniMenu() {
  isShowMiniMenu.value = false;
}

onMounted(() => {
  scroll.value = document.documentElement.scrollTop;
  isStickTop.value = scroll.value > 10 ? true : false;
  //监听滚动事件
  window.addEventListener("scroll", (e) => {
    //滚动条高度大于10的时候导航栏固定
    scroll.value = document.documentElement.scrollTop;
    scroll.value > 10 ? (isStickTop.value = true) : (isStickTop.value = false);
  });
});
</script>

<style scoped>
.menus .router-link-active {
  color: #ace0f9;
  font-weight: bold;
}

.head.stickTop .menus .router-link-active,
.head:hover .menus .router-link-active {
  color: #51a6e6;
}

.loginAndRegister {
  background-color: #fff !important;
  box-shadow: none;
  color: #000 !important;
}

.stickTop {
  background-color: #fff !important;
  box-shadow: 0 -5px 25px #ccc;
  color: #000 !important;
}

.forceStatic {
  color: #000 !important;
  box-shadow: 0 -5px 10px #ccc;
}

@media screen and (max-width: 1200px) {
  .head .menus .menu-link {
    font-size: 14px;
    transition: all 0.5s;
  }
}

.head img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.head {
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  justify-content: space-between;
  padding: 0 var(--mtop);
  background-color: rgba(255, 255, 255, 0);
  transition: background-color 0.2s linear;
  color: var(--defaultColor);
  z-index: 99;
}

.head:hover {
  background-color: var(--defaultColor);
  box-shadow: 0 -5px 25px #ccc;
  color: #000;
}

.head:hover .logo a {
  background-color: rgba(255, 255, 255);
}

.head .logo {
  display: inline-block;
  text-align: center;
  /* width: 7.5rem; */
  font-weight: bold;
  font-family: tsxmm;
}

.head .logo a {
  line-height: 4.5rem;
  font-size: 1.875rem;
  background-color: rgba(255, 244, 244, 0.5);
  border-radius: 15px;
  padding: 0.5rem;
}

.head .menus {
  display: flex;
  justify-content: space-around;
}

.hide {
  display: none !important;
}

.head .other .search a,
.head .other .user a {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.head .menus .logo {
  display: none;
}

@media screen and (max-width: 768px) {
  .menuBtn {
    display: flex !important;
    height: 50px;
  }

  .head .menus .logo {
    display: block;
    font-size: 1.8rem;
    padding: 1.5rem 1rem 2rem;
    font-family: tsxmm;
    margin-bottom: 10px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }

  .closed {
    display: flex !important;
    justify-content: center;
    align-items: center;
    position: absolute;
    right: 15px;
    top: 15px;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.05);
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .closed:hover {
    background-color: rgba(0, 0, 0, 0.1);
    transform: rotate(90deg);
  }

  .miniMenuShow {
    left: 0 !important;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
  }

  .head {
    justify-content: space-between;
    padding: 0;
  }

  .head .logo {
    display: none;
  }

  .menus .menu::after {
    display: none;
  }

  .head .menus {
    position: fixed;
    left: -100vw;
    top: 0;
    flex-direction: column;
    justify-content: flex-start;
    height: 100vh;
    width: 280px;
    background-color: #fff;
    box-shadow: 0 0 10px var(--shadow);
    text-align: center;
    color: #000;
    transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
    overflow-y: auto;
    padding: 20px 0;
    z-index: 1000;
  }

  .head .menus a {
    width: 100%;
    line-height: 50px;
    padding: 0 20px;
    margin: 5px 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
    border-radius: 8px;
  }

  .head .menus a:hover {
    background-color: rgba(0, 0, 0, 0.05);
    transform: translateX(5px);
  }

  .other {
    margin-right: 15px;
  }

  .head .other .search,
  .head .other .user {
    width: 5rem;
  }

  .head .other .user {
    height: 5rem;
  }
  .menus {
    --menu-width: 100% !important;
  }
}
.menus {
  --menu-width: 6rem;
  --menu-line-height: 4.375rem;
}
.menus .el-dropdown {
  width: var(--menu-width);
  height: 100%;
  line-height: var(--menu-line-height);
  color: inherit;
  font-family: tsxmm;
  font-size: inherit;
}

.menus .el-dropdown :deep(.el-dropdown-link) {
  width: 100%;
  text-align: center;
  outline: none;
}

:deep(.el-dropdown-menu__item) {
  padding: 0;
}

:deep(.el-dropdown-menu__item a) {
  padding: 5px 16px;
}

.menus .menu-link {
  display: inline-block;
  letter-spacing: 2px;
  text-align: center;
  line-height: var(--menu-line-height);
  width: var(--menu-width);
  font-family: tsxmm;
}

.head .other {
  display: flex;
  justify-content: center;
  align-items: center;
}

.search,
.user {
  width: 3rem;
  text-align: center;
  cursor: pointer;
}

.user {
  height: 3rem;
}

.head .other .search:hover,
.head .other .user:hover {
  color: aqua;
  transition: all 0.5s;
}

.head .other .search span,
.head .other .user span {
  font-size: 25px;
}

.menuBtn {
  line-height: 55px;
  font-size: 25px;
  margin-left: 15px;
  cursor: pointer;
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.3s;
}

.menuBtn:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.menu {
  width: 100%;
  margin: 5px 0;
}

@media screen and (max-width: 768px) {
  .menus .el-dropdown {
    width: 100%;
    height: auto;
    padding: 0 20px;
    margin: 5px 0;
  }

  .menus .el-dropdown :deep(.el-dropdown-link) {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px 0;
  }

  .head .other .search span,
  .head .other .user span {
    font-size: 22px;
  }
}
</style>

<template>
  <div id="defaultLayout" :style="{ paddingTop: headStickTop && '5rem' }">
    <Header
      :menus="menus"
      :user="props.user"
      :logoText="websiteSetting?.logo_text"
      :stick-top="headStickTop"
      @toggleSearch="toggleSearch"
    ></Header>
    <BackTop />
    <LazySearch :isSearchShow="isSearchShow" @toggleSearch="toggleSearch" />
    <slot></slot>
    <Footer :list="footerList" v-if="showFooter" />
    <ClientOnly>
      <Pet v-if="showPet"></Pet>
      <GlobalMusic v-if="showMusic" />
      <GlobalAiChat />
      <GlobalSetting
        @isShowMusic="onMusicSetting"
        @is-show-pet="onPetSetting"
      />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import type { UserStateType } from "~/types/user";

const props = withDefaults(
  defineProps<{
    user?: UserStateType;
    headStickTop?: boolean;
    showFooter?: boolean;
  }>(),
  {
    showFooter: true,
  }
);

const websiteSetting = await useWebsiteSetting();
const footerList = websiteSetting.value?.footer_text?.split("\n");

const showMusic = ref(false);
const showPet = ref(false);
let isSearchShow = ref(false);

const onMusicSetting = (flag: boolean) => {
  showMusic.value = flag;
};

const onPetSetting = (flag: boolean) => {
  showPet.value = flag;
};

let menus = [
  {
    title: "首页",
    icon: "&#xe6e6;",
    path: "/",
  },
  {
    title: "文章",
    icon: "&#xe6b8;",
    childMenus: [
      {
        title: "归档",
        icon: `<svg t="1704813081949" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5929" width="16" height="16"><path d="M224 322.6h576c16.6 0 30-13.4 30-30s-13.4-30-30-30H224c-16.6 0-30 13.4-30 30 0 16.5 13.5 30 30 30zM290.1 178.4h443.8c16.6 0 30-13.4 30-30s-13.4-30-30-30H290.1c-16.6 0-30 13.4-30 30s13.4 30 30 30zM629.6 613.9H394.4c-16.6 0-30 13.4-30 30s13.4 30 30 30h235.2c16.6 0 30-13.4 30-30s-13.4-30-30-30z" p-id="5930"></path><path d="M850.3 403.9H173.7c-33 0-60 27-60 60v360c0 33 27 60 60 60h676.6c33 0 60-27 60-60v-360c0-33-27-60-60-60z m-0.1 419.8l-0.1 0.1H173.9l-0.1-0.1V464l0.1-0.1h676.2l0.1 0.1v359.7z" p-id="5931"></path></svg>`,
        path: "/article/archive",
      },
      {
        title: "标签",
        icon: `<svg t="1704813215148" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7045" width="16" height="16"><path d="M995.125144 559.61812l-415.998603-415.998602A52.986489 52.986489 0 0 0 541.413335 127.99957H338.847348c-3.166656-26.559911-9.286635-51.046495-17.999939-71.333094C299.734146 7.333309 271.154242 0 256.00096 0c-13.939953 0-40.439864 6.339979-61.259794 48.806503-10.473298 21.366595-17.946606 48.966502-21.573261 79.193067H53.334974a53.393154 53.393154 0 0 0-53.333154 53.333154v360.078791a52.986489 52.986489 0 0 0 15.619948 37.713206l415.998602 415.998603a53.333154 53.333154 0 0 0 75.426413 0l26.286579-26.293245 26.286578 26.293245a53.426487 53.426487 0 0 0 16.719944 11.333295 21.333262 21.333262 0 0 0 36.079879 11.293295l382.705381-382.705381a53.399821 53.399821 0 0 0 0-75.426413z m-762.070774-491.998347C241.494342 50.373164 250.667645 42.666523 256.00096 42.666523c5.99998 0 16.573278 9.639968 25.646581 30.806564 6.493312 15.159949 11.333295 33.999886 14.146619 54.526483H216.16776c3.206656-23.419921 9.013303-44.359851 16.88661-60.41313z m243.819181 897.330319a10.666631 10.666631 0 0 1-15.079949 0l-415.998603-415.998603A10.573298 10.573298 0 0 1 42.668343 541.411515V181.332724a10.666631 10.666631 0 0 1 10.666631-10.666631h245.332509c0 47.853173-10.373298 92.15969-27.066575 115.632945-5.926647 8.326639-16.566611 14.186619-22.306592 16.113279C204.041135 314.752276 170.667913 356.218803 170.667913 405.331972c0 58.813136 47.853173 106.666308 106.666309 106.666308s106.666308-47.853173 106.666308-106.666308c0-47.086508-30.666564-87.139707-73.079754-101.246327C330.060711 272.705751 341.334007 223.692582 341.334007 170.666093h72.079758a10.573298 10.573298 0 0 1 7.539974 3.126656l415.998603 415.998603a10.666631 10.666631 0 0 1 0 15.079949zM341.334007 405.331972a63.999785 63.999785 0 1 1-63.999785-63.999785 64.073118 64.073118 0 0 1 63.999785 63.999785z m263.539114 559.61812a10.666631 10.666631 0 0 1-15.079949 0L563.499927 938.663513l303.625647-303.61898a53.399821 53.399821 0 0 0 0-75.426413L478.16688 170.666093h63.246455a10.573298 10.573298 0 0 1 7.539974 3.126656l415.998603 415.998603c0.239999 0.239999 0.466665 0.486665 0.666664 0.746664l0.086667 0.106666a10.666631 10.666631 0 0 1 0 13.373289l-0.086667 0.106666c-0.213333 0.259999-0.439999 0.506665-0.666664 0.746664z" fill="#5C5C66" p-id="7046"></path></svg>`,
        path: "/article/tags",
      },
    ],
  },
  {
    title: "聊天室",
    icon: "&#xe63a;",
    path: "/chat",
  },
  // {
  //   title: "留言板",
  //   icon: "&#xe60c;",
  //   path: "/message"
  // },
  // {
  //   title: "友人帐",
  //   icon: "&#xe6bc;",
  //   path: "/friends"
  // },
  {
    title: "关于",
    icon: "&#xe608;",
    path: "/about",
  },
];

function toggleSearch(flag) {
  const html = document.documentElement;
  const hiddenScrollClassName = "hiddenScroll";
  flag
    ? html.classList.add(hiddenScrollClassName)
    : html.classList.remove(hiddenScrollClassName);
  isSearchShow.value = flag;
}
</script>

<style></style>

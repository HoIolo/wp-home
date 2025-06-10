<template>
  <div class="account_content">
    <div class="account-left">
      <div class="account-title">
        <span>个人中心</span>
      </div>
      <ul class="account-ui">
        <!-- 信息栏 -->
        <template v-for="(item, index) in accountProps.accountList">
          <li
            class="account-list"
            :class="{ 'account-list-active': props.active === index }"
          >
            <nuxt-link :to="item.linkpath">
              <el-icon
                class="account-list-icon"
                :size="24"
                :color="props.active === index ? '#fff' : '#000'"
              >
                <User v-if="index === 0" />
                <Edit v-if="index === 1" />
                <Document v-if="index === 2" />
              </el-icon>
              <span>{{ item.title }}</span>
            </nuxt-link>
          </li>
        </template>
      </ul>
      <slot name="info-bottom">
        <!-- 退出登录 -->
        <div class="account-exit">
          <el-button type="danger" @click.prevent="exit">
            <span>退出登录</span>
          </el-button>
        </div>
      </slot>
    </div>
    <div class="account-right">
      <div class="account-right-title">
        <span class="accout-right-title-icon"></span>
        <span class="account-right-title-text">{{ props.title }}</span>
      </div>
      <div class="account_wrap">
        <slot name="account-wrap"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Edit, User, Document } from "@element-plus/icons";

const router = useRouter();

const props = defineProps<{
  active: number;
  title: string;
}>();

const accountProps = ref({
  active: 1,
  accountList: [
    {
      title: "我的信息",
      linkpath: "/account",
    },
    {
      title: "编辑文章",
      linkpath: "/account/editArticle",
    },
    {
      title: "发布历史",
      linkpath: "/account/articleHistory",
    },
  ],
  title: "我的信息",
});

// 退出登录
function exit() {
  // 清除token
  const token = useCookie("token");
  token.value = "";
  // 清除vuex保存的状态
  cleanUserState();
  useMessage({
    message: "退出成功！",
    type: "success",
  });
  // 跳转首页
  router.push("/");
}
</script>

<style scoped>
.account_content {
  display: flex;
  /* width: 60%;    */
  width: 888px;
  font-size: 16px;
  margin: var(--mtop) auto;
  border-radius: 10px;
  border: 1px solid #e7e7e7;
  overflow: hidden;
}

.account_content .account-left {
  position: relative;
  flex: 1;
  min-width: 150px;
  background-color: #fafafa;
  border-right: 1px solid #ddd;
}

.account_content .account-right {
  position: relative;
  flex: 5;
}

.account-left .account-title {
  text-align: center;
  height: 50px;
  line-height: 50px;
  color: #666;
  border-bottom: 1px solid #ddd;
  font-family: 'tsxmm';
}

.account-left .account-ui {
  min-height: 147px;
}

.account-left .account-ui .account-list a {
  display: block;
  text-align: center;
  height: 48px;
  line-height: 48px;
  color: #222;
  font-family: 'tsxmm';
}

.account-left .account-ui .account-list a:hover {
  background-color: #ccc;
}

.account-left .account-ui .account-list + .account-list a {
  margin-top: 1px;
}

.account-left .account-ui .account-list-active a {
  background-color: var(--baseColor) !important;
}

.account-left .account-ui .account-list-active a {
  color: #fff;
}

.account-left .account-ui .account-list .account-list-icon {
  margin-right: 10px;
  vertical-align: middle;
}

.account-right .account-right-title .accout-right-title-icon {
  float: left;
  width: 4px;
  height: 16px;
  margin-right: 5px;
  margin-top: 16px;
  background-color: var(--baseColor);
}

.account-right .account-right-title .account-right-title-text {
  float: left;
  font-family: 'tsxmm';
}

.account-right .account-right-title {
  height: 50px;
  line-height: 50px;
  padding-left: 30px;
  color: var(--baseColor);
  border-bottom: 1px solid #ddd;
}

.account-right .account-right-title::after {
  content: "";
  display: block;
  clear: both;
}

.account-exit {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
}

.account-exit .el-button {
  width: 100%;
  font-size: 16px;
  border-radius: 0;
  height: 40px;
  font-family: "tsxmm";
}

.account_wrap {
  padding: 20px;
}
@media screen and (max-width: 720px) {
  .account_content {
    width: 50rem;
    flex-direction: column;
  }

  .account_content .account-left {
    display: flex;
  }

  .account_content .account-left > div,
  .account_content .account-left > ul li {
    padding: 0 15px;
  }
  .account-ui,
  .account-exit {
    display: none;
  }
  .account-left .account-title,
  .account_content .account-left {
    border: none;
  }
  .account_wrap :deep(.el-form-item) {
    flex-direction: column;
  }
}
</style>

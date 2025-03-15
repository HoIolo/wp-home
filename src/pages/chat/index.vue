<template>
  <nuxt-layout name="default">
    <Banner :height="'50vh'" :background="background">聊天室</Banner>
    <nuxt-layout name="container" :showUserInfo="false">
      <template #containerLeftMain>
        <client-only>
          <div class="chart" v-if="isLogin">
            <div class="chart-left">
              <UserInfo :user="userData" />
              <!-- 聊天对象 -->
              <div class="chart-object">
                <div
                  class="chart-object-item"
                  v-for="item in chartObjects"
                  :key="item?.id"
                  :class="{ active: item.active }"
                  @click="changeChartObject(item.id)"
                >
                  <el-row align="middle" :gutter="10">
                    <el-col :span="10.1">
                      <div class="chart-object-item-avatar">
                        <el-avatar :size="40" fit="cover" :src="item.avatar" />
                      </div>
                    </el-col>
                    <el-col :span="18.5">
                      <div class="chart-object-item-text">
                        <el-text class="mx-1" size="large" :truncated="true">{{
                          item.name
                        }}</el-text>
                      </div>
                    </el-col>
                  </el-row>
                </div>
              </div>
            </div>
            <div class="chart-right">
              <el-drawer
                size="50%"
                :z-index="5"
                :lock-scroll="false"
                v-model="chartBoxDrawer"
                title="用户在线列表"
              >
                <div class="chart-list">
                  <template v-for="item in userQueue" :key="item?.user?.uid">
                    <div class="chart-list-item">
                      <el-avatar
                        :src="
                          transformUpYunPicUrl({
                            url: item?.onlineUser?.avatar,
                            options: { width: 40 },
                          })
                        "
                      ></el-avatar>
                      <span class="chart-list-item-name">{{
                        item?.onlineUser?.name
                      }}</span>
                    </div>
                  </template>
                </div>
              </el-drawer>
              <div class="chart-top">
                <span>{{ chartBoxData.chartTitle }}</span>
                <span class="online-people" v-show="chartBoxData.isGroupChat"
                  >当前在线({{ userCount }})人</span
                >
                <span v-show="!chartBoxData.isGroupChat" class="aimodel_select">
                  <span>AI模型:</span>
                  <el-select v-model="aiModel">
                    <!-- <el-option value="qwen-turbo" label="turbo"></el-option> -->
                    <!-- <el-option value="kimi" label="kimi"></el-option> -->
                    <el-option value="qwen-max" label="max"></el-option>
                    <!-- <el-option
                      value="qwen-max-1201"
                      label="max-1201"
                    ></el-option>
                    <el-option
                      value="qwen-max-longcontext"
                      label="max-longcontext"
                    ></el-option> -->
                  </el-select>
                </span>
                <span
                  v-show="chartBoxData.isGroupChat"
                  class="online-count-controll"
                  @click="chartBoxDrawer = true"
                >
                  <svg
                    t="1704512492974"
                    class="icon"
                    viewBox="0 0 1024 1024"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    p-id="9537"
                    width="32"
                    height="32"
                  >
                    <path
                      d="M324.8 360c0 76.8 52.8 140.8 118.4 140.8 65.6 0 118.4-62.4 118.4-140.8s-52.8-140.8-118.4-140.8c-64 1.6-118.4 64-118.4 140.8z m198.4 0c0 54.4-35.2 99.2-78.4 99.2s-78.4-44.8-78.4-99.2 35.2-99.2 78.4-99.2 78.4 44.8 78.4 99.2zM665.6 790.4c17.6 0 33.6-8 43.2-22.4 9.6-12.8 12.8-30.4 8-46.4-27.2-91.2-134.4-150.4-273.6-150.4-137.6 0-244.8 59.2-273.6 150.4-4.8 16-1.6 32 8 46.4 9.6 12.8 25.6 22.4 43.2 22.4h444.8z m-456-56c22.4-73.6 116.8-121.6 235.2-121.6 118.4 0 212.8 49.6 235.2 121.6 1.6 4.8 0 9.6-1.6 11.2-3.2 3.2-6.4 4.8-11.2 4.8H222.4c-4.8 0-8-1.6-11.2-4.8-1.6-1.6-3.2-6.4-1.6-11.2zM595.2 460.8v40c65.6 0 118.4-62.4 118.4-140.8s-52.8-140.8-118.4-140.8v40c43.2 0 78.4 44.8 78.4 99.2s-35.2 102.4-78.4 102.4zM718.4 587.2l-6.4 40c67.2 11.2 115.2 64 126.4 108.8 1.6 4.8 0 8-3.2 11.2-1.6 1.6-4.8 4.8-9.6 4.8h-64v40h64c16 0 32-8 41.6-20.8 9.6-12.8 14.4-30.4 9.6-46.4-16-67.2-83.2-126.4-158.4-137.6z"
                      fill="#707070"
                      p-id="9538"
                    ></path>
                  </svg>
                </span>
              </div>
              <div
                class="chart-wrap"
                ref="chartWrapRef"
                @scroll="handleChartWrapScroll"
              >
                <template
                  v-for="item in chartBoxData.charts"
                  :key="item?.user?.id"
                >
                  <div
                    class="chart-item"
                    :class="{ 'current-user': item?.user?.id === userData?.id }"
                  >
                    <div class="chart-user-avatar">
                      <el-avatar
                        :src="
                          transformUpYunPicUrl({
                            url: item?.user?.avatar,
                            options: { widthAndHeight: '40x40' },
                          })
                        "
                      ></el-avatar>
                    </div>
                    <div class="chart-msg">
                      <div class="chart-user-name">
                        <span>{{ item?.user?.name }}</span>
                      </div>
                      <div class="chart-user-msg">
                        <MdPreview
                          :modelValue="item?.msg"
                          :editorId="'a' + item.id"
                        />
                      </div>
                    </div>
                  </div>
                </template>
              </div>
              <div class="chart-send">
                <div class="chart-text">
                  <textarea
                    v-model="chartMsg"
                    @keydown.prevent.enter="getCurrentSendHandle"
                    name=""
                    id=""
                    placeholder="请输入……"
                    autofocus
                  ></textarea>
                </div>
                <div class="chart-send-btn">
                  <el-button
                    type="primary"
                    size="small"
                    @click="getCurrentSendHandle"
                    >发送</el-button
                  >
                </div>
              </div>
            </div>
          </div>
        </client-only>
      </template>
    </nuxt-layout>
  </nuxt-layout>
</template>

<script setup lang="ts">
import { MdPreview } from "md-editor-v3";
import "md-editor-v3/lib/preview.css";
import type { UserStateType } from "~/types/user";
import { ElNotification, ElMessageBox } from "element-plus";
import { io } from "socket.io-client";
import { getAIReply, type GetAiReplyBody } from "~/api/aiApi";

let transport = "polling";
if (process.client) {
  if (!!window.WebSocket && window.WebSocket.prototype.send) {
    // 支持WebSocket
    console.log("您的浏览器支持Websocket通信协议");
    transport = "websocket";
  } else {
    // 不支持WebSocket
    console.log(
      "您的浏览器不支持Websocket通信协议，请使用Chrome或者Firefox浏览器！"
    );
  }
}
const socket = io(useRuntimeConfig().public.socket_url, {
  transports: [transport],
});

useHead({
  title: "聊天室",
});

const background = "linear-gradient(135deg,#FD6E6A 10%,#FFC600 100%)";

const aiModel = ref("qwen-max");
const chartMsg = ref<string>("");
const userCount = ref<number>(0);
const userQueue = ref<Array<any>>([]);
const isLogin = ref<boolean>(false);
const chartBoxDrawer = ref<boolean>(false);

const chartWrapRef = ref<HTMLDivElement>();

const router = useRouter();

const [err, userData] = await useCatch<Ref<UserStateType>>(useUserState());

// 用户未登录
if (userData.value) isLogin.value = true;

type ChartUser = {
  id: number | string;
  name: string;
  avatar: string;
};

type Charts = {
  id: number | string;
  user: ChartUser;
  msg: string;
  conversation_id?: string;
};

type ChartObjects = ChartUser & {
  active: boolean;
  isGroupChat: boolean;
  charts: Charts[];
  sendHandle: any;
};

// 聊天对象数据
const chartObjects = ref<ChartObjects[]>([
  // {
  //   id: 0,
  //   name: "AI助手",
  //   avatar: "https://xiaoxiblog.oss-cn-beijing.aliyuncs.com/image/aibot.png",
  //   active: false,
  //   isGroupChat: false,
  //   charts: [],
  //   sendHandle: aiSend,
  // },
  {
    id: 1,
    name: "聊天室",
    avatar:
      "https://xiaoxiblog.oss-cn-beijing.aliyuncs.com/image/chatgroup.png",
    active: true,
    isGroupChat: true,
    charts: [],
    sendHandle: chartSend,
  },
]);

const getCurrentSendHandle = computed(() => {
  const currentChart = chartObjects.value.find((item) => item.active);
  return currentChart.sendHandle;
});

/**
 * 获取AI上次会话id
 */
const getAiPrevConversationId = computed(() => {
  const currentCharts = chartObjects.value.find((item) => item.active).charts;
  return currentCharts[currentCharts.length - 3]?.conversation_id || "";
});

async function aiSend() {
  if (chartMsg.value === "") {
    return;
  }

  const id = Math.random().toString(36).substring(2, 9);
  const aiChartBox = chartObjects.value.find((item) => item.id === 0);

  // 自己发言
  aiChartBox.charts.push({
    id: userData.value.id as number,
    user: userData as any,
    msg: chartMsg.value,
  });
  // ai输入
  aiChartBox.charts.push({
    id,
    user: {
      id: 0,
      name: "AI助手",
      avatar: "https://xiaoxiblog.oss-cn-beijing.aliyuncs.com/image/aibot.png",
    },
    msg: "输入中……",
    conversation_id: "",
  });
  const prompt = chartMsg.value;
  // 清空聊天框
  chartMsg.value = "";
  updateChartWrapScroll();
  const aiChart = aiChartBox.charts.find((item) => item.id === id);
  const getAiReplyBody: GetAiReplyBody = {
    ai: "TY",
    prompt,
    isStream: true,
    conversation_id: getAiPrevConversationId.value || "none",
  };

  const response = await getAIReply(aiModel.value, getAiReplyBody);
  let i = 0;
  handleAiSSERes(response, getAiReplyBody.ai, (content, responseData) => {
    if (i === 0) aiChart.msg = "";
    aiChart.conversation_id = responseData.id || responseData.request_id;
    aiChart.msg += content;

    updateChartWrapScroll();
    i++;
  });
}

// 聊天框数据
const chartBoxData = ref({
  isGroupChat: true,
  chartTitle: "聊天室",
  charts: [],
});

/**
 * 更改聊天对象
 * @param id 当前选中的id
 */
const changeChartObject = (id: number | string) => {
  chartObjects.value.forEach((item) => {
    item.active = item.id === id;
  });
  updateChartWrapScroll();
};

watch(
  chartObjects,
  () => {
    if (isLogin.value) {
      const activeObject = chartObjects.value.find((item) => item.active);
      const chartTitle = activeObject.name;
      const groupChats = chartObjects.value.filter(
        (item) => item.isGroupChat && item.active
      );
      const isGroupChat = groupChats.length > 0;
      chartBoxData.value = {
        isGroupChat,
        chartTitle,
        charts: activeObject.charts,
      };
    }
  },
  { deep: true, immediate: true }
);

// 是否更新滚到到底部
const isScrollToBottom = ref<boolean>(true);

// 监听聊天框滚动条事件
const handleChartWrapScroll = (e: any) => {
  const target = e.target;
  isScrollToBottom.value = false;
  if (target.scrollTopMax - target.scrollTop < target.offsetHeight) {
    // 进入可更新滚动条区域
    isScrollToBottom.value = true;
  }
};

if (isLogin.value && process.client) {
  socket.on("connect", () => {
    console.log("连接成功");
    socket.emit("userFadeIn", {
      user: userData.value,
      status: "连接",
    });
  });

  // 监听用户状态-
  socket.on("users", (data) => {
    let status = data.currentUser.status == "在线" ? "进入" : "离开";
    if (data.trigger === "fadeIn") {
      ElNotification({
        title: "通知",
        message: "欢迎" + data.currentUser.onlineUser.name + status + "聊天室",
        offset: 75,
      });
    }
    userQueue.value = data.userQueue;
    userCount.value = data.userQueue.length;
  });

  // 监听消息的回显
  socket.on("chartMsg", (data) => {
    // 拿到聊天室对象
    const chartRoom = chartObjects.value.find((item) => item.isGroupChat);
    if (data.hasOwnProperty("length")) {
      chartRoom.charts = data;
    } else {
      chartRoom.charts.push(data);
    }
    if (isScrollToBottom.value) {
      // 更新滚动条高度
      updateChartWrapScroll();
    }
  });

  // 监听用户离开
  socket.on("userFadeOut", (data) => {
    ElNotification({
      title: "通知",
      message: data.onlineUser.name + "离开了聊天室",
      offset: 75,
    });
  });

  onBeforeUnmount(() => {
    // 取消事件监听
    socket.removeListener("connect");
    socket.removeListener("users");

    // 断开连接
    socket.disconnect();
  });
} else {
  // 未登录
  ElMessageBox.alert("您还未登录，请先登录再来使用吧~", "消息提示", {
    confirmButtonText: "确认",
    type: "warning",
    callback: () => {
      router.push("/login");
    },
  });
}

// 发送消息
function chartSend() {
  if (chartMsg.value === "") {
    return;
  }
  // 将聊天信息传送服务器
  socket.emit("chartMsg", {
    user: userData.value,
    msg: chartMsg.value,
  });
  // 发送消息后,调整为可更新滚动条高度
  isScrollToBottom.value = true;
  // 清空聊天框
  chartMsg.value = "";
}

const updateChartWrapScroll = () => {
  nextTick(() => {
    if (!chartWrapRef.value) return;
    chartWrapRef.value.style.overflow = "visible";
    const height = chartWrapRef.value.offsetHeight;
    chartWrapRef.value.style.overflow = "auto";
    chartWrapRef.value.scrollTop = height || 0;
  });
};

onMounted(() => {
  updateChartWrapScroll();
});
</script>

<style scoped>
.el-avatar {
  --el-avatar-bg-color: transparent;
}
.chart {
  flex: 0.7;
  display: flex;
  justify-content: space-between;
  min-height: 500px;
  height: 70vh;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 10px;
  box-shadow: 0 0 50px #fff0f0;
  overflow: hidden;
  --borderColor: #f1f1f1;
  --bgc: #f8f8f8;
}

.chart .chart-left {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  background-image: linear-gradient(150deg, #fff1eb 30%, #ace0f9 100%);
}

.chart .chart-left .chart-object {
  padding: 5px;
}

.chart .chart-left .chart-object .chart-object-item {
  padding: 10px;
  border-radius: 10px;
  cursor: pointer;
  user-select: none;
}

.chart .chart-left .chart-object .chart-object-item:hover {
  background-color: #ffffff7a;
}

.chart .chart-left .chart-object .chart-object-item.active {
  background-color: var(--baseColor);
}

.chart .chart-left .chart-object .chart-object-item.active .el-text {
  color: var(--defaultColor);
}

.chart .chart-left .userInfo {
  position: static;
  background-color: transparent;
  box-shadow: none;
  height: 3.5rem;
}

.chart .chart-left .userInfo :deep(.userData) {
  display: none;
}

.chart .chart-left .userInfo :deep(.userContact) {
  display: none;
}

.chart .userInfo :deep(.userIns img) {
  position: absolute;
  top: 0;
  left: 0;
  width: 3rem;
  height: 3rem;
  outline: 5px solid var(--defaultColor);
}

.chart .userInfo :deep(.userIns .userName),
.chart .userInfo :deep(.userIns .userSignatrue) {
  display: none;
}

.chart .chart-right {
  position: relative;
  flex: 3;
  display: flex;
  justify-content: space-between;
  flex-flow: column wrap;
}

.chart .chart-right :deep(.el-overlay) {
  position: absolute;
}

.chart .chart-right :deep(.el-overlay .el-drawer__body) {
  padding: 0;
}

.chart .chart-right :deep(.el-overlay .el-drawer__header) {
  margin-bottom: 0;
}

.chart .chart-right .chart-top {
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--borderColor);
  padding: 0 20px;
  line-height: 50px;
  background-color: var(--bgc);
}

.chart .chart-right .chart-top .online-count-controll,
.chart .chart-right .chart-top .aimodel_select {
  margin-left: auto;
  cursor: pointer;
}

.chart .chart-right .chart-top .aimodel_select {
  display: flex;
  justify-content: center;
  align-items: center;
}

.chart .chart-right .chart-top .aimodel_select .el-select {
  width: 160px;
  margin-left: 10px;
}

.chart .chart-right .chart-top .online-people {
  margin-left: 15px;
  font-size: 14px;
  color: #666;
}

.chart .chart-right .chart-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow: auto;
}

.chart .chart-right .chart-wrap .chart-item {
  display: flex;
  margin: 15px 0;
}

/* 当前用户发消息显示在右侧 */
.chart .chart-right .chart-wrap .current-user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.chart .chart-right .chart-wrap .chart-item .chart-user-avatar {
  margin-right: 15px;
}

.chart .chart-right .chart-wrap .chart-user-msg {
  padding: 10px;
  border-radius: 10px;
  background-color: var(--chart-user-text-bgc);
  color: #fff;
}

/* 当前用户发消息显示在右侧 */
.chart .chart-right .chart-wrap .current-user .chart-user-avatar {
  margin-right: 0;
  margin-left: 15px;
}

.chart .chart-right .chart-wrap .current-user .chart-user-msg {
  background-color: var(--chart-current-user-text-bgc);
}

.chart .chart-right .chart-wrap .current-user .chart-user-name {
  text-align: right;
}

.chart .chart-right .chart-wrap .chart-item .chart-user-name {
  margin: 5px 0;
  color: #777;
}

.chart .chart-right .chart-send {
  position: relative;
  border-top: 1px solid var(--borderColor);
}

.chart .chart-right .chart-send .chart-text textarea {
  display: block;
  width: 100%;
  height: 120px;
  font-size: 16px;
  padding: 10px 0 0 15px;
  resize: none;
  outline: none;
  border: none;
  border-bottom-right-radius: 10px;
  font-family: system-ui;
}

.chart .chart-right .chart-send .chart-send-btn {
  position: absolute;
  right: 5px;
  bottom: 5px;
}

.chart-list {
  flex: 1;
  padding: 5px;
  overflow: auto;
}

.chart-list .tip {
  padding: 0 10px;
}

.chart-list .chart-list-item {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  margin: 5px 0;
  background-color: #fff;
  border-radius: 15px;
}
.chart-list .chart-list-item:hover {
  background-color: #f8f8f8;
}
.chart-list .chart-list-item .chart-list-item-name {
  margin-left: 15px;
  font-size: 16px;
}
:deep(.md-editor-preview-wrapper) {
  padding: 0;
}
:deep(.default-theme p) {
  padding: 0 !important;
}
:deep(.md-editor) {
  background: none;
  color: #fff;
}
:deep(.default-theme) {
  color: #fff;
}
@media screen and (max-width: 768px) {
  .chart {
    flex: 0.9;
    font-size: 2rem;
    flex-direction: column;
  }
  .chart .chart-left .chart-object {
    display: flex;
    padding: 10px;
  }
  .chart .chart-left {
    flex: none
  }
  .chart .chart-left .chart-object  .el-avatar {
    --el-avatar-size: 20px !important;
  }
  .chart .chart-left .chart-object .chart-object-item {
    padding: 5px 10px;
  }
  .chart .chart-left .userInfo {
    display: none;
  }
}
</style>

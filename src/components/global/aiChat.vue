<template>
  <div
    class="ai-chat-container"
    :class="{ 'ai-chat-open': isOpen }"
    :style="{ left: position.x + 'px', bottom: position.y + 'px' }"
  >
    <!-- 悬浮按钮 -->
    <div class="ai-chat-button" @click="toggleChat" @mousedown="startDrag">
      <el-avatar
        :size="40"
        fit="cover"
        src="https://xiaoxiblog.oss-cn-beijing.aliyuncs.com/image/aibot.png"
      />
    </div>

    <!-- 聊天窗口 -->
    <div class="ai-chat-window">
      <div class="ai-chat-header">
        <span>AI助手</span>
        <span class="ai-model-select">
          <span>AI模型:</span>
          <el-select v-model="aiModel" size="small">
            <el-option value="qwen-max" label="max"></el-option>
          </el-select>
        </span>
        <el-icon class="close-icon" @click="toggleChat"><Close /></el-icon>
      </div>

      <div class="ai-chat-messages" ref="messagesRef">
        <template v-for="item in chatMessages" :key="item?.id">
          <div
            class="ai-chat-message"
            :class="{ 'current-user': item?.user?.id === userData?.id }"
          >
            <div class="message-avatar">
              <el-avatar :size="30" :src="item?.user?.avatar"></el-avatar>
            </div>
            <div class="message-content">
              <div class="message-name">
                <span>{{ item?.user?.name }}</span>
              </div>
              <div class="message-text">
                <MdPreview :modelValue="item?.msg" :editorId="'a' + item.id" />
              </div>
            </div>
          </div>
        </template>
      </div>

      <div class="ai-chat-input">
        <textarea
          v-model="chatMsg"
          @keydown.prevent.enter="sendMessage"
          placeholder="请输入问题..."
          rows="3"
          :disabled="isAiResponding"
        ></textarea>
        <el-button
          :type="isAiResponding ? 'danger' : 'primary'"
          size="small"
          @click="sendMessage"
        >
          {{ isAiResponding ? "停止" : "发送" }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { MdPreview } from "md-editor-v3";
import "md-editor-v3/lib/preview.css";
import { Close } from "@element-plus/icons-vue";
import { getAIReply, type GetAiReplyBody } from "~/api/aiApi";
import type { UserStateType } from "~/types/user";

const isOpen = ref(false);
const aiModel = ref("qwen-max");
const chatMsg = ref("");
const messagesRef = ref<HTMLDivElement>();
const chatMessages = ref<any[]>([]);
const userData = ref<UserStateType | null>(null);

// AI响应相关状态
const isAiResponding = ref(false);
const currentReader = ref<ReadableStreamDefaultReader | null>(null);

// 拖拽相关状态
const position = ref({ x: 20, y: 100 }); // 初始位置
const isDragging = ref(false);
const dragOffset = ref({ x: 0, y: 0 });

// 获取用户信息
onMounted(async () => {
  const [_, userDataValue] = await useCatch<Ref<UserStateType>>(useUserState());
  userData.value = userDataValue.value;

  // 添加初始欢迎消息
  if (chatMessages.value.length === 0) {
    chatMessages.value.push({
      id: "welcome",
      user: {
        id: 0,
        name: "AI助手",
        avatar:
          "https://xiaoxiblog.oss-cn-beijing.aliyuncs.com/image/aibot.png",
      },
      msg: "你好！我是AI助手，有什么可以帮助你的吗？",
    });
  }

  // 添加全局鼠标事件监听
  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);
});

// 组件卸载前移除事件监听
onBeforeUnmount(() => {
  document.removeEventListener("mousemove", handleMouseMove);
  document.removeEventListener("mouseup", handleMouseUp);
});

// 开始拖拽
const startDrag = (event) => {
  // 如果是点击事件而不是拖拽，不处理
  if (event.target.closest(".ai-chat-window")) return;

  isDragging.value = true;

  // 计算鼠标/触摸点击位置与元素左上角的偏移量
  const rect = event.currentTarget.getBoundingClientRect();
  const clientX = event.clientX || (event.touches && event.touches[0].clientX);
  const clientY = event.clientY || (event.touches && event.touches[0].clientY);

  dragOffset.value = {
    x: clientX - rect.left,
    y: clientY - rect.top,
  };

  // 阻止默认行为和冒泡
  event.preventDefault();
};

// 拖拽中
const handleMouseMove = (event) => {
  if (!isDragging.value) return;

  // 获取鼠标/触摸位置
  const clientX = event.clientX || (event.touches && event.touches[0].clientX);
  const clientY = event.clientY || (event.touches && event.touches[0].clientY);

  // 计算新位置，考虑元素本身的高度
  const buttonHeight = 50; // AI聊天按钮的高度
  position.value = {
    x: clientX - dragOffset.value.x,
    y: window.innerHeight - clientY + dragOffset.value.y - buttonHeight,
  };

  // 防止拖出视口
  if (position.value.x < 0) position.value.x = 0;
  if (position.value.y < 0) position.value.y = 0;
  if (position.value.x > window.innerWidth - 50)
    position.value.x = window.innerWidth - 50;
  if (position.value.y > window.innerHeight - buttonHeight)
    position.value.y = window.innerHeight - buttonHeight;

  event.preventDefault();
};

// 结束拖拽
const handleMouseUp = () => {
  isDragging.value = false;
};

// 切换聊天窗口
const toggleChat = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    setTimeout(() => {
      scrollToBottom();
    }, 300);
  }
};

// 停止AI响应
const stopAiResponse = async () => {
  if (currentReader.value) {
    try {
      await currentReader.value.cancel();
      currentReader.value = null;
      isAiResponding.value = false;
    } catch (error) {
      console.error("停止AI响应出错:", error);
    }
  }
};

// 发送消息或停止AI响应
const sendMessage = async () => {
  // 如果AI正在响应，则停止响应
  if (isAiResponding.value) {
    await stopAiResponse();
    return;
  }

  if (!chatMsg.value.trim() || !userData.value) return;

  // 添加用户消息
  chatMessages.value.push({
    id: Date.now(),
    user: userData.value,
    msg: chatMsg.value,
  });

  // 添加AI正在输入的消息
  const aiMessageId = Math.random().toString(36).substring(2, 9);
  chatMessages.value.push({
    id: aiMessageId,
    user: {
      id: 0,
      name: "AI助手",
      avatar: "https://xiaoxiblog.oss-cn-beijing.aliyuncs.com/image/aibot.png",
    },
    msg: "输入中……",
    conversation_id: "",
  });

  // 保存用户问题并清空输入框
  const prompt = chatMsg.value;
  chatMsg.value = "";
  scrollToBottom();

  // 获取上一次对话ID
  const prevConversationId =
    chatMessages.value.length >= 3
      ? chatMessages.value[chatMessages.value.length - 3]?.conversation_id || ""
      : "";

  // 调用AI接口
  const getAiReplyBody: GetAiReplyBody = {
    ai: "TY",
    prompt,
    isStream: true,
    conversation_id: prevConversationId || "none",
  };

  try {
    isAiResponding.value = true;
    const response = await getAIReply(aiModel.value, getAiReplyBody);
    let i = 0;
    const aiMessage = chatMessages.value.find(
      (item) => item.id === aiMessageId
    );

    // 保存reader以便可以取消
    currentReader.value = (response as any).body.getReader();

    // 自定义处理SSE响应
    try {
      while (true) {
        // 如果已经停止响应，则退出循环
        if (!isAiResponding.value || !currentReader.value) break;

        const { done, value } = await currentReader.value.read();
        if (done) break;

        let result = new TextDecoder().decode(value, { stream: true });
        const aiObj = getSSEAiReply(getAiReplyBody.ai);

        const lines = result.split("\n").filter((line) => line.trim() !== "");

        lines.forEach((line) => {
          try {
            const dataObj = aiObj.parseJson(line);
            const content = aiObj.getContent(dataObj) || "";

            if (i === 0) aiMessage.msg = "";
            aiMessage.conversation_id = dataObj.id || dataObj.request_id;
            aiMessage.msg += content;
            scrollToBottom();
            i++;
          } catch (e) {}
        });
      }
    } catch (error) {
      console.error("处理AI响应出错:", error);
    } finally {
      isAiResponding.value = false;
      currentReader.value = null;
    }
  } catch (error) {
    console.error("AI回复出错:", error);
    const aiMessage = chatMessages.value.find(
      (item) => item.id === aiMessageId
    );
    if (aiMessage) {
      aiMessage.msg = "抱歉，我遇到了一些问题，请稍后再试。";
    }
    isAiResponding.value = false;
    currentReader.value = null;
    scrollToBottom();
  }
};

// 滚动到底部
const scrollToBottom = () => {
  setTimeout(() => {
    if (messagesRef.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight;
    }
  }, 50);
};

// 监听消息变化，自动滚动到底部
watch(
  chatMessages,
  () => {
    scrollToBottom();
  },
  { deep: true }
);
</script>

<style scoped>
.ai-chat-container {
  position: fixed;
  z-index: 999;
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  transition: none; /* 移除位置过渡效果，使拖拽更流畅 */
  user-select: none; /* 防止拖拽时选中文本 */
}

.ai-chat-button {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s;
  z-index: 2;
}

.ai-chat-button:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.15);
}

.ai-chat-window {
  width: 550px;
  height: 600px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin-left: -350px;
  opacity: 0;
  transform: translateX(-20px);
  transition: all 0.3s ease;
  pointer-events: none;
}

.ai-chat-open .ai-chat-window {
  margin-left: 15px;
  opacity: 1;
  transform: translateX(0);
  pointer-events: all;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .ai-chat-window {
    width: 100vw;
    height: 100vh;
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    right: 0;
    margin-left: 0;
    transform: translateY(20px);
    border-radius: 0;
    z-index: -1;
  }

  .ai-chat-open .ai-chat-window {
    margin-left: 0;
    transform: translateY(0);
  }

  .ai-chat-container {
    flex-direction: column;
    align-items: flex-end;
  }

  .ai-chat-button {
    position: fixed;
    right: 20px;
    bottom: 20px;
    z-index: 9998;
  }
}

.ai-chat-header {
  height: 50px;
  background: linear-gradient(135deg, #2abce9 10%, #1976d2 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px;
  font-weight: bold;
}

.ai-model-select {
  display: flex;
  align-items: center;
  font-size: 12px;
  gap: 5px;
}

.close-icon {
  cursor: pointer;
  font-size: 18px;
}

/* 移动端适配头部 */
@media screen and (max-width: 768px) {
  .ai-chat-header {
    padding: 0 10px;
  }

  .ai-model-select {
    font-size: 10px;
    gap: 3px;
    pointer-events: none
  }

  .ai-chat-open .ai-model-select {
    pointer-events: all;
  }

  .ai-model-select :deep(.el-select) {
    width: 70px;
  }
}

.ai-chat-messages {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
  background-color: #f5f5f5;
}

.ai-chat-message {
  display: flex;
  margin-bottom: 15px;
}

.current-user {
  flex-direction: row-reverse;
}

.message-avatar {
  margin: 0 10px;
}

.message-content {
  max-width: 70%;
}

.current-user .message-content {
  text-align: right;
}

/* 移动端适配消息 */
@media screen and (max-width: 768px) {
  .ai-chat-messages {
    flex: 1;
    max-height: calc(100vh - 150px);
  }

  .message-content {
    max-width: 80%;
  }

  .message-avatar {
    margin: 0 5px;
  }
}

.message-name {
  font-size: 12px;
  color: #999;
  margin-bottom: 5px;
}

.message-text {
  background-color: #fff;
  padding: 10px;
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.message-text .md-editor-previewOnly,
.message-text ::v-deep(.md-editor-preview-wrapper) {
  padding: 0;
  background: none;
}
.message-text ::v-deep(p) {
  padding: 0;
}

.current-user .message-text {
  background-color: #e1f5fe;
}

.ai-chat-input {
  padding: 10px;
  border-top: 1px solid #eee;
  display: flex;
  flex-direction: column;
}

.ai-chat-input textarea {
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 8px;
  margin-bottom: 10px;
  resize: none;
  outline: none;
  font-family: "auto";
}

.ai-chat-input button {
  align-self: flex-end;
}

/* 移动端适配输入框 */
@media screen and (max-width: 768px) {
  .ai-chat-input {
    padding: 10px;
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: #fff;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  }

  .ai-chat-input textarea {
    padding: 8px;
    margin-bottom: 8px;
    max-height: 80px;
  }

  .ai-chat-input button {
    padding: 6px 15px;
    border-radius: 18px;
  }
}
</style>

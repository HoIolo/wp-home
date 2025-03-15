<template>
  <div class="setting">
    <el-popover :visible="visible" :width="160" placement="left-start">
      <div class="setting_wrap">
        <div class="setting_item">
          <div class="setting_label">音乐播放器</div>
          <div class="setting_option">
            <el-switch
              v-model="showMusic"
              @change="handleChange('isShowMusic', showMusic)"
            />
          </div>
        </div>
        <div class="setting_item">
          <div class="setting_label">吉祥物</div>
          <div class="setting_option">
            <el-switch
              v-model="showPet"
              @change="handleChange('isShowPet', showPet)"
            />
          </div>
        </div>
      </div>
      <template #reference>
        <div class="setting_btn" @click="visible = !visible">
          <el-icon><Setting /></el-icon>
        </div>
      </template>
    </el-popover>
  </div>
</template>

<script setup lang="ts">
import { Setting } from "@element-plus/icons-vue";

const emit = defineEmits(["isShowMusic", "isShowPet"]);

const visible = ref(false);
const showMusic = ref(false);
const showPet = ref(false);

onMounted(() => {
  showMusic.value = JSON.parse(localStorage.getItem("isShowMusic") || "false");
  showPet.value = JSON.parse(localStorage.getItem("isShowPet") || "false");
  handleChange("isShowMusic", showMusic.value);
  handleChange("isShowPet", showPet.value);
});

const handleChange = (emitKey: any, emitVal: any) => {
  localStorage.setItem(emitKey, emitVal);
  emit(emitKey, emitVal);
};
</script>

<style scoped>
.setting {
  position: fixed;
  right: 40px;
  bottom: 20px;
  z-index: 10;
}
.setting_wrap {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.setting_wrap .setting_item {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  column-gap: 15px;
}
.setting_btn {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fff;
  padding: 5px 15px;
  border: 1px solid #ccc;
  font-size: 18px;
  border-radius: 12px;
  color: #000;
  cursor: pointer;
  transition: all .5s;
}
.setting_btn:hover {
    background-color: #2ABCE9;
    color: #fff;
    border-color: #2ABCE9;
}
.setting_btn:hover i {
    animation: none;
}
.setting_btn i {
  animation: rotateInfinite 2s linear infinite;
}
@media screen and (max-width: 768px) {
  .setting {
    display: none;
  }
}
@keyframes rotateInfinite {
  0% {
    transform: rotate(0);
  }

  25% {
    transform: rotate(90deg);
  }

  50% {
    transform: rotate(180deg);
  }

  75% {
    transform: rotate(270deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>

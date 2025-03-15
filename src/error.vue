<template>
  <div class="error_container">
    <div class="error_box">
      <div class="message">{{ errorMessage }}</div>
    </div>
    <div class="back">
      <a @click.prevent="backLastPage" class="back_btn" href="#">返回首页</a>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  error: Object,
});
console.log(props.error);

const router = useRouter();
const backLastPage = () => {
  router.push("/");
};
const errorMessages = [
  {
    code: 404, message: "非常抱歉，该页面不存在！"
  },
  {
    code: 500, message: "服务器错误，请稍后再试！"
  }
];
const errorMessage = errorMessages.find((item) => item.code == props.error?.statusCode)?.message;
useHead({
  title: errorMessage,
});
</script>

<style scoped>
.error_container {
  --base-color: #32bae3;
  --shadow-color: #c0f6ff;
  padding-top: 200px;
  min-height: 100vh;
  background-color: #dfdbe5;
  background-image: url("data:image/svg+xml,%3Csvg width='42' height='44' viewBox='0 0 42 44' xmlns='http://www.w3.org/2000/svg'%3E%3Cg id='Page-1' fill='none' fill-rule='evenodd'%3E%3Cg id='brick-wall' fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M0 0h42v44H0V0zm1 1h40v20H1V1zM0 23h20v20H0V23zm22 0h20v20H22V23z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

.error_box {
  position: relative;
  width: fit-content;
  margin: 0px auto 80px;
  padding: 0 30px;
  line-height: 4rem;
  font-size: 22px;
  border: 4px solid var(--base-color);
  color: var(--base-color);
  border-radius: 10px;
  transform: rotate(-5deg);
  box-shadow: 0px 4px 30px var(--shadow-color);
  background-color: #fff;
}

.error_box::before,
.error_box::after {
  content: "";
  position: absolute;
  bottom: 4rem;
  width: 4px;
  background-color: var(--base-color);
  transform: rotate(5deg);
}

.error_box::before {
  left: 10%;
  height: 218px;
}

.error_box::after {
  right: 10%;
  height: 198px;
}

.back_btn {
  display: block;
  width: fit-content;
  margin: 0 auto;
  padding: 0 15px;
  color: #fff;
  background-color: var(--base-color);
  line-height: 3rem;
  opacity: 1;
  border-radius: 5px;
  background: rgba(50, 186, 227, 1);
  box-shadow: 0px 4px 20px var(--shadow-color);
}
</style>

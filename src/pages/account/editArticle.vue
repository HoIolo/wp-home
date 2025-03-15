<template>
  <nuxt-layout name="default" :user="userState">
    <Banner :height="'50vh'">账户</Banner>
    <nuxt-layout name="account" :active="1" :title="'编辑文章'">
      <template #account-wrap>
        <el-form
          :model="editForm"
          label-width="50px"
          :rules="rules"
          ref="ruleFormRef"
        >
          <el-form-item label="标题:" prop="title">
            <el-input
              type="text"
              name=""
              id="text"
              v-model="editForm.title"
            ></el-input>
          </el-form-item>
          <el-form-item class="tagsInput" label="标签:" prop="tags">
            <client-only>
              <el-select
                multiple
                filterable
                :multiple-limit="3"
                allow-create
                v-model="editForm.tags"
                class="m-2"
                placeholder="请选择文章标签"
                size="large"
              >
                <el-option
                  v-for="item in tagsList"
                  :key="item.id"
                  :label="item.tagName"
                  :value="item.tagName"
                />
              </el-select>
            </client-only>
          </el-form-item>
          <el-form-item label="类型:" prop="type_id">
            <client-only>
              <el-select
                v-model="editForm.type_id"
                class="m-2"
                placeholder="请选择文章类型"
                size="large"
              >
                <el-option
                  v-for="item in typeOptions"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id + ''"
                />
              </el-select>
            </client-only>
          </el-form-item>
          <el-form-item label="图片:" prop="imageUrl">
            <el-upload
              class="avatar-uploader"
              name="file"
              :action="uploadUrl"
              :show-file-list="false"
              :on-success="handleAvatarSuccess"
              :before-upload="beforeAvatarUpload"
              :with-credentials="true"
              :headers="uploadHeaders"
            >
              <img
                v-if="editForm.imageUrl"
                :src="editForm.imageUrl"
                class="avatar"
              />
              <el-icon v-else class="avatar-uploader-icon">
                <Plus />
              </el-icon>
            </el-upload>
          </el-form-item>
          <el-form-item label="摘要:" prop="snippet">
            <el-row :gutter="10" style="width: 100%">
              <el-col
                :span="23"
                v-loading="AIIsWritting"
                element-loading-text="AI代写中..."
              >
                <el-input
                  type="textarea"
                  name=""
                  :rows="4"
                  id="snippet"
                  v-model="editForm.snippet"
                ></el-input>
              </el-col>
              <el-col :span="1">
                <el-tooltip
                  class="box-item"
                  effect="dark"
                  content="AI帮写"
                  placement="top"
                >
                  <button @click.prevent="handleAIWrite" class="ai_btn">
                    <img
                      src="https://cloud.hoiolo.cn/image/AI_icon.png!v1/format/webp/both/32x32"
                      alt=""
                    />
                  </button>
                </el-tooltip>
              </el-col>
            </el-row>
          </el-form-item>
          <el-form-item label="内容:" prop="content">
            <client-only>
              <MdEditor
                @onSave="saveEditorContent"
                @onUploadImg="uploadEditorImg"
                v-model="editForm.content"
              />
            </client-only>
          </el-form-item>
          <el-form-item class="article-btn-wrap">
            <div class="article-my-btn">
              <el-button
                type="primary"
                size="default"
                @click="submitForm(ruleFormRef)"
                >发布</el-button
              >
            </div>
          </el-form-item>
        </el-form>
      </template>
    </nuxt-layout>
  </nuxt-layout>
</template>

<script setup lang="ts">
import type { FormInstance } from "element-plus";
import { Plus } from "@element-plus/icons";
import type { UploadProps } from "element-plus";
import { MdEditor } from "md-editor-v3";
import "md-editor-v3/lib/style.css";
import { addArticle } from "~/api/articleApi";
import { getAIReply, type GetAiReplyBody } from "~/api/aiApi";
import { uploadImage } from "~/api/common";
import { getTags } from "~/api/tagsApi";
import { getArticleTypes } from "~/api/articleTypeApi";

useHead({
  title: "文章编辑",
});
const router = useRouter();
const ruleFormRef = ref<FormInstance>();

const uploadUrl = ref("");
uploadUrl.value = useRuntimeConfig().public.requestBaseUrl + "/image";
const uploadHeaders = ref<any>({});
const token = useCookie("token");
uploadHeaders.value["authorization"] = "Bearer " + token.value;

let [err, userState] = await useCatch(useUserState());

const defaultContent = "##### 这里填写内容";
const editForm = reactive<{
  title: string;
  snippet: string;
  content: string;
  type_id: string;
  imageUrl: string;
  tags: string[];
}>({
  title: "",
  type_id: "",
  snippet: "",
  content: defaultContent,
  imageUrl: "",
  tags: [],
});

if (process.client) {
  editForm.content = localStorage.getItem("editContent") || defaultContent;
}

const { data: getTagsResponse } = await getTags({ offset: 100 });
const tagsList = ref(getTagsResponse.value?.data?.rows || []);

watch(
  getTagsResponse,
  (value) => {
    tagsList.value = value?.data?.rows || [];
  },
  { deep: true }
);

const { data: getArticleTypesResponse } = await getArticleTypes({offset: 100});
const typeOptions = ref(getArticleTypesResponse.value?.data?.rows || []);

watch(
  getArticleTypesResponse,
  (value) => {
    typeOptions.value = value?.data?.rows || [];
  },
  { deep: true }
);

const AIIsWritting = ref(false);

/**
 * AI写摘要
 */
const handleAIWrite = async () => {
  if (editForm.content === "") {
    useMessage({
      message: "请先填写文章内容",
      type: "error",
    });
    return;
  }
  if (editForm.content.length <= 300) {
    useMessage({
      message: "文章内容不少于300字数",
      type: "error",
    });
    return;
  }
  if (AIIsWritting.value === true) {
    return;
  }
  // 如何之前存在内容，则置空
  if (editForm.snippet !== "") editForm.snippet = "";
  AIIsWritting.value = true;
  const prompt = "请帮我写一段文章摘要,字数不超过两百个字符,文章内容如下:";
  const model = "Qwen/Qwen2.5-7B-Instruct";
  const getAiReplyBody: GetAiReplyBody = {
    ai: "SF",
    prompt: prompt + editForm.content,
    isStream: true,
  };
  const response = await getAIReply(model, getAiReplyBody);
  await handleAiSSERes(response, getAiReplyBody.ai, (content) => {
    editForm.snippet += content;
  });
  AIIsWritting.value = false;
};

// 图片上传前校验
const beforeAvatarUpload: UploadProps["beforeUpload"] = (rawFile) => {
  if (rawFile.size / 1024 / 1024 > 5) {
    useMessage({
      message: "图片文件不能超过5mb!",
      type: "error",
    });
    return false;
  }
  return true;
};

// 图片添加成功hook
const handleAvatarSuccess: UploadProps["onSuccess"] = (
  response,
  uploadFile
) => {
  if (response.code === 1001) {
    editForm.imageUrl = response.data.row;
  }
  // editForm.imageUrl = URL.createObjectURL(uploadFile.raw!)
};

// 保存编辑器内容
const saveEditorContent = (v) => {
  localStorage.setItem("editContent", v);
  useMessage({
    message: "保存成功",
    type: "success",
  });
};

// 上传编辑器图片
const uploadEditorImg = async (files, callback) => {
  const res = await Promise.all(
    files.map((file) => {
      return new Promise((rev, rej) => {
        const form = new FormData();
        form.append("file", file);
        uploadImage(form)
          .then((res) => {
            rev({
              data: {
                url: res.data.value.data.row,
              },
            });
          })
          .catch((error) => rej(error));
      });
    })
  );

  callback(res.map((item) => item.data.url + "!v1"));
};

/**
 * el-form 表单空值校验
 * @param rule
 * @param value
 * @param callback
 */
function nullCheck(rule: any, value: any, callback: any) {
  if ((value ?? "") === "") {
    callback(new Error("不能为空"));
  } else {
    callback();
  }
}

/**
 * 校验标签选项
 * @param rule
 * @param value
 * @param callback
 */
function checkTags(rule: any, value: any, callback: any) {
  console.log(" ", value);
  if (value.length === 0) {
    callback(new Error("请选择标签"));
  } else {
    callback();
  }
}

/**
 * 表单规则校验
 */
const rules = reactive({
  title: [
    {
      validator: nullCheck,
      trigger: "blur",
    },
  ],
  snippet: [
    {
      validator: nullCheck,
      trigger: "blur",
    },
  ],
  content: [
    {
      validator: nullCheck,
    },
  ],
  type: [
    {
      validator: nullCheck,
      trigger: "blur",
    },
  ],
  imageUrl: [
    {
      validator: nullCheck,
    },
  ],
  tags: [
    {
      validator: checkTags,
      trigger: "blur",
    },
  ],
});

/**
 * 提交发布文章
 */
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  const userState = await useUserState();
  formEl.validate(async (valid) => {
    if (valid) {
      const { data } = await addArticle({
        author_id: userState.value.user.id,
        title: editForm.title,
        content: editForm.content,
        type_id: editForm.type_id,
        description: editForm.snippet,
        pic: editForm.imageUrl,
        tags: editForm.tags,
      });
      if (data.value.code === 1001) {
        useMessage({
          message: "发布成功",
          type: "success",
        });
        localStorage.removeItem("editContent");
        setTimeout(() => {
          router.push("/");
        }, 1000);
      }
    } else {
      useMessage({
        message: "表单填写不完整",
        type: "error",
      });
      console.log("error submit!");
      return false;
    }
  });
};
</script>

<style scoped>
.tagsInput :deep(.el-select) {
  width: 80%;
}
:deep(.md-editor-fullscreen) {
  z-index: 99;
}
:deep(.el-form-item__label) {
  font-family: "tsxmm";
  width: 10.5rem;
  max-width: 100px;
}
:deep(.md-editor-toolbar-wrapper) {
  overflow: auto;
}

:deep(.md-editor-footer) {
  height: auto;
}

:deep(.md-editor-toolbar-wrapper .md-editor-toolbar),
:deep(
    .md-editor-toolbar-wrapper .md-editor-toolbar-left,
    .md-editor-toolbar-wrapper .md-editor-toolbar-right
  ) {
  flex-wrap: wrap;
}

.article-btn-wrap :deep(.el-form-item__content) {
  justify-content: end;
}

.avatar-uploader .avatar {
  width: 178px;
  height: 178px;
  display: block;
}
.ai_btn {
  width: 32px;
  height: 32px;
  background: none;
  outline: none;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
:deep(.hljs-comment),
:deep(.code-block) {
  white-space: pre-wrap;
}
</style>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}
</style>

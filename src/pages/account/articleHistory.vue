<template>
  <nuxt-layout name="default" :user="userState">
    <Banner :height="'50vh'">账户</Banner>
    <nuxt-layout name="account" :active="2" :title="'文章发布历史'">
      <template #account-wrap>
        <div class="article-history-wrap">
          <div v-if="loading" class="loading-container">
            <el-skeleton :rows="5" animated />
          </div>
          <div v-else-if="articles.length === 0" class="empty-container">
            <el-empty description="暂无发布文章" />
          </div>
          <div v-else class="article-list">
            <el-card
              v-for="article in articles"
              :key="article.id"
              class="article-item"
              shadow="hover"
            >
              <div class="article-header">
                <h3 class="article-title">{{ article.title }}</h3>
                <div class="article-meta">
                  <span class="publish-date"
                    >发布时间：{{ formatDate(article.publish_date) }}</span
                  >
                  <span class="view-count"
                    ><el-icon><View /></el-icon> {{ article.watch_num }}</span
                  >
                  <span class="comment-count"
                    ><el-icon><ChatDotRound /></el-icon>
                    {{ article.comment_num }}</span
                  >
                  <el-tag
                    :type="statusType(article.is_approved)"
                    effect="dark"
                    class="status-tag"
                  >
                    {{ statusText(article.is_approved) }}
                  </el-tag>
                </div>
              </div>
              <div class="review-result" v-if="article.is_approved === 3">
                <el-alert
                  title="审核未通过"
                  type="error"
                  :description="article.reject_reason || '未提供审核意见'"
                  show-icon
                  :closable="false"
                />
              </div>
              <div class="article-content">
                <div class="article-image" v-if="article.pic">
                  <el-image
                    :src="article.pic"
                    fit="cover"
                    :preview-src-list="[article.pic]"
                  ></el-image>
                </div>
                <div class="article-desc">
                  <p>{{ article.description }}</p>
                </div>
              </div>
              <div class="article-tags">
                <el-tag
                  v-for="tag in article.tags"
                  :key="tag"
                  size="small"
                  effect="light"
                  class="article-tag"
                  >{{ tag }}</el-tag
                >
              </div>
              <div class="article-actions">
                <el-button
                  v-if="article.is_approved === 2"
                  type="primary"
                  size="small"
                  @click="viewArticle(article.id)"
                  >查看文章</el-button
                >
                <el-button
                  type="info"
                  size="small"
                  @click="editArticle(article.id)"
                  >编辑文章</el-button
                >
              </div>
            </el-card>
            <div class="pagination-container">
              <el-pagination
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :page-sizes="[5, 10, 20, 50]"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
              />
            </div>
          </div>
        </div>
      </template>
    </nuxt-layout>
  </nuxt-layout>
</template>

<script setup lang="ts">
import { View, ChatDotRound } from "@element-plus/icons-vue";
import { getArticleByUid, type GetArticleByUidType } from "~/api/articleApi";
import type { ArticleType } from "~/types/article";

useHead({
  title: "文章发布历史",
});

const router = useRouter();
const articles = ref<ArticleType[]>([]);
const loading = ref(true);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const userState = await useUserState();

// 创建参数对象
const queryParams = computed<GetArticleByUidType>(() => ({
  uid: userState.value?.id || 0,
  page: currentPage.value,
  offset: pageSize.value,
  is_approved: -1, 
  order: "DESC"
}));

// 使用useAsyncData封装API调用
const { data, refresh, pending } = await getArticleByUid(queryParams.value);

// 处理数据变化
watch(data, (newData) => {
  if (newData?.code === 1001) {
    articles.value = newData.data.rows;
    total.value = newData.data.count;
  } else {
    articles.value = [];
    total.value = 0;
  }
}, { immediate: true });

// 处理加载状态
watch(pending, (isPending) => {
  loading.value = isPending;
}, { immediate: true });

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// 获取状态文本
const statusText = (status: number): string => {
  const statusMap: Record<number, string> = {
    0: "待审核",
    1: "审核中",
    2: "审核通过",
    3: "审核不通过",
  };
  return statusMap[status] || "未知状态";
};

// 获取状态标签类型
const statusType = (status: number) => {
  switch (status) {
    case 0:
      return "info"; // 待审核
    case 1:
      return "warning"; // 审核中
    case 2:
      return "success"; // 审核通过
    case 3:
      return "danger"; // 审核不通过
    default:
      return "info"; // 其他状态
  }
};

// 处理页面大小变化
const handleSizeChange = (val) => {
  pageSize.value = val;
};

// 处理页码变化
const handleCurrentChange = (val) => {
  currentPage.value = val;
};

// 查看文章
const viewArticle = (id) => {
  router.push(`/article/${id}`);
};

// 编辑文章
const editArticle = (id) => {
  router.push(`/account/editArticle?id=${id}`);
};
</script>

<style scoped>
.article-history-wrap {
  min-height: 500px;
}
.loading-container,
.empty-container {
  padding: 40px 0;
  text-align: center;
}

.article-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.article-item {
  transition: all 0.3s;
}

.article-item:hover {
  transform: translateY(-5px);
}

.article-header {
  margin-bottom: 15px;
}

.article-title {
  margin: 0 0 10px 0;
  font-family: "tsxmm";
  color: var(--el-text-color-primary);
}

.article-meta {
  display: flex;
  gap: 15px;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.article-content {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
}

.article-image {
  flex: 0 0 180px;
  height: 120px;
  overflow: hidden;
  border-radius: 4px;
}

.article-desc {
  flex: 1;
  font-size: 14px;
  color: var(--el-text-color-regular);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-tags {
  margin-bottom: 15px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.article-tag {
  margin-right: 0;
}

.article-actions {
  display: flex;
  justify-content: flex-start;
  gap: 10px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.status-tag {
  margin-left: auto;
}

.review-result {
  margin: 10px 0;
}
</style>

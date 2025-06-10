<template>
  <nuxt-layout name="default">
    <Banner :height="'50vh'" :background="backgroundImage">{{
      article_data?.title || '文章详情'
    }}</Banner>
    <nuxt-layout
      name="container"
      :user="userData"
      :showUserInfo="false"
      :showRight="!isArticleRejectedOrPending"
    >
      <template #containerLeftMain>
        <!-- 审核不通过时的显示内容 -->
        <div v-if="!pending && isArticleRejected" class="article-rejected">
          <el-result
            icon="error"
            title="文章未通过审核"
            :sub-title="rejectMessage"
          >
            <template #extra>
              <div class="reject-reason">
                <h3>审核未通过原因：</h3>
                <p>{{ rejectReason }}</p>
              </div>
            </template>
          </el-result>
        </div>
        
        <!-- 审核中状态显示内容 -->
        <div v-else-if="!pending && isArticlePending" class="article-pending">
          <el-result
            icon="info"
            title="文章审核中"
            :sub-title="pendingMessage"
          >
          </el-result>
        </div>

        <!-- 正常文章内容显示（审核通过） -->
        <el-skeleton v-else :loading="pending" animated style="padding: 25px 10px">
          <template #template>
            <el-skeleton-item
              variant="p"
              style="width: 50%; margin: auto; display: block; height: 28px"
            />
            <div>
              <el-skeleton-item
                variant="p"
                style="margin: 25px auto; display: block; width: 80%"
              />
              <div class="skeletion_text" style="padding: 10px 20px">
                <el-skeleton-item
                  v-for="i in 10"
                  :key="i"
                  variant="p"
                  :style="{
                    width: i % 4 === 0 || i === 1 ? '50%' : '100%',
                    marginBottom: '25px',
                  }"
                  style="margin: 15px 0; display: block"
                />
              </div>
            </div>
          </template>
          <template #default>
            <div class="article_content">
              <div class="article_title">
                <h1>{{ article_data?.title }}</h1>
              </div>
              <div class="article_info">
                <div class="publish_date">
                  <el-icon>
                    <Calendar />
                  </el-icon>
                  <span>{{
                    dayjs(article_data?.publish_date).format("YYYY-MM-DD")
                  }}</span>
                </div>
                <div class="article_author">
                  <el-icon>
                    <UserFilled />
                  </el-icon>
                  <span>{{ article_data?.author.profile.name }}</span>
                </div>
                <div class="article_watch">
                  <el-icon>
                    <Cellphone />
                  </el-icon>
                  <span>{{ article_data?.watch_num }}次阅读</span>
                </div>
                <div class="comment_num">
                  <el-icon>
                    <ChatLineSquare />
                  </el-icon>
                  <span>{{ commentData?.data?.count || 0 }}条评论</span>
                </div>
              </div>
              <div id="article" class="content">
                <MdPreview
                  :modelValue="article_data?.content"
                  :editorId="mdState.id"
                />
              </div>
            </div>
          </template>
        </el-skeleton>
        
        <!-- 评论部分只在审核通过时显示 -->
        <ClientOnly v-if="!isArticleRejectedOrPending">
          <UserComment
            :config="config"
            :request-comments="requestComments"
            :article-id="article_data?.id || 0"
            :comment-data="commentData"
            :userData="userData || {}"
          ></UserComment>
        </ClientOnly>
      </template>
      <template #containerRight>
        <MdCatalog
          v-if="!isArticleRejectedOrPending"
          :editorId="mdState.id"
          :scrollElement="scrollElement"
          :scrollElementOffsetTop="100"
        />
      </template>
    </nuxt-layout>
  </nuxt-layout>
</template>

<script setup lang="ts">
import { MdPreview, MdCatalog } from "md-editor-v3";
import "md-editor-v3/lib/preview.css";
import {
  Calendar,
  ChatLineSquare,
  Cellphone,
  UserFilled,
} from "@element-plus/icons";
import emoji from "~/assets/emoji";
import { type ConfigApi, type CommentApi, isEmpty } from "undraw-ui";
import { dayjs } from "element-plus";
import { getArticleDetail } from "~/api/articleApi";
import { selectComment } from "~/api/commentApi";
import type { Comment } from "~/types/comment";
import type { ResponseData, ResponseType } from "~/types/common";
import type { ArticleErrorType, ArticleType } from "~/types/article";

const route = useRoute();
const router = useRouter();

const mdState = reactive({
  id: "my-editor",
});

let scrollElement = ref();
if (process.client) scrollElement.value = document.documentElement;

// 获取用户数据
const userData = await useUserState();

const id: string = route.params.id as string;
const {
  data,
  refresh: refreshArticleData,
  pending,
} = await getArticleDetail(id);

// 判断是否是审核不通过的文章
const isArticleRejected = computed(() => {
  const articleData = data.value?.data?.row as ArticleErrorType;
  return !pending.value && articleData?.status === 3;
});

// 判断是否是审核中的文章
const isArticlePending = computed(() => {
  const articleData = data.value?.data?.row as ArticleErrorType;
  return !pending.value && articleData?.status === 1;
});

// 判断文章是否被拒绝或者处于审核中状态
const isArticleRejectedOrPending = computed(() => {
  return isArticleRejected.value || isArticlePending.value;
});

// 审核未通过的信息
const rejectMessage = computed(() => {
  const articleData = data.value?.data?.row as ArticleErrorType;
  return articleData?.message || "文章未通过审核";
});

// 审核未通过的原因
const rejectReason = computed(() => {
  const articleData = data.value?.data?.row as ArticleErrorType;
  return articleData?.reason || "未提供具体原因";
});

// 审核中的信息
const pendingMessage = computed(() => {
  const articleData = data.value?.data?.row as ArticleErrorType;
  return articleData?.message || "文章正在审核中，请稍后查看";
});

const article_data = computed(() => {
  if (!pending.value) {
    // 如果文章审核不通过或者审核中，不返回文章内容
    if (isArticleRejectedOrPending.value) {
      return null;
    }

    if (!data.value) {
      throw createError({
        statusCode: 404,
        statusMessage: "Page Not Found",
      });
    }

    return data.value.data.row as ArticleType;
  }
  return null;
});

useHead({
  title: article_data.value?.title || rejectMessage.value || pendingMessage.value || "详情页",
});

// 背景图片
const backgroundImage = computed(() => {
  return "https://cloud.hoiolo.cn/image/ec8fc4f2a0ab79395fa197d14c02c98767180942.jpg!v1/format/webp/fh/400";
});

const page = ref(1);
const offset = ref(5);
// 请求评论区数据;
async function requestComments(articleId, page, offset) {
  if (articleId) {
    const { data, refresh: commentRefresh } = await selectComment({
      page: page,
      article_id: articleId,
      offset: offset,
    });
    return data;
  }
}

const commentData = ref<ResponseType<ResponseData<Comment>>>();

watch(data, async (newData) => {
  if (newData) {
    const articleData = newData.data.row as ArticleType;
    const commentRes = await requestComments(
      articleData.id,
      page.value,
      offset.value
    );
    if (isEmpty(commentRes?.value)) {
      return;
    }
    commentData.value = commentRes.value;

    // 更新评论数据
    config.comments = getComments(commentData?.value?.data.rows) || [];
    config.total = commentData?.value?.data.count || 0;
    getFlatLikeIds();
    config.user.likeIds = flatLikeIds.value;
  }
});

// 将数据处理成CommentApi类型
function getComments(commentRows): CommentApi[] {
  return commentRows?.map((item): CommentApi => {
    const replyList = item.replys?.map((reply): CommentApi => {
      return {
        id: reply.id,
        parentId: reply.comment_id,
        uid: reply.user_id,
        address: "",
        likes: reply.likes?.length,
        user: {
          username: reply.user.profile.name,
          avatar: reply.user.profile.avatar,
          level: reply.user.role,
          homeLink: "/",
        },
        // createTime: dayjs(reply.createTime).format(dateFormat),
        createTime: formatRelativeTime(reply.createTime),
        content: reply.content,
      };
    });

    return {
      id: item.id,
      parentId: null,
      uid: item.user?.id || 0,
      address: "",
      content: item.content,
      likes: item.likes?.length,
      user: {
        username: item.user.profile.name,
        avatar: item.user.profile.avatar,
        level: item.user.role,
        homeLink: "/",
      },
      // createTime: dayjs(item.createTime).format(dateFormat),
      createTime: formatRelativeTime(item.createTime),
      reply: {
        total: item.replys?.length,
        list: replyList,
      },
    };
  });
}

const flatLikeIds = ref<any[]>([]);

// 获取评论id数组
function getFlatLikeIds() {
  let likeIds = commentData.value?.data.rows?.map((comment) => {
    const userId = userData.value?.id;
    const commentLikes = comment.likes?.filter((user) => user.id === userId);
    const replyIds = comment.replys.map((reply) => {
      const replyLikes = reply.likes?.filter((user) => user.id === userId);
      if (replyLikes?.length > 0) {
        return reply.id;
      }
    });

    if (commentLikes?.length > 0) {
      return replyIds.concat([comment.id]);
    }
  });
  if (likeIds?.length !== 0) {
    flatLikeIds.value = [].concat(...likeIds);
    flatLikeIds.value = flatLikeIds.value.filter(
      (likeId) => likeId !== undefined
    );
  }
}

if (article_data.value?.id) {
  const commentRes = await requestComments(
    article_data.value.id,
    page.value,
    offset.value
  );
  commentData.value = commentRes.value;
  getFlatLikeIds();
}

const config = reactive<ConfigApi>({
  user: {
    id: userData.value?.id || 0,
    username: userData.value?.name || "游客",
    avatar: userData.value?.avatar || "",
    // 评论id数组 建议:存储方式用户uid和评论id组成关系,根据用户uid来获取对应点赞评论id,然后加入到数组中返回
    likeIds: flatLikeIds.value || [],
  },
  emoji: emoji,
  comments: getComments(commentData?.value?.data?.rows) || [],
  total: commentData?.value?.data?.count || 0,
});
</script>

<style scoped lang="less">
.article-rejected, .article-pending {
  padding: 30px 20px;
  background-color: var(--defaultColor);
  border-radius: 11px;
  
  .reject-reason {
    margin: 20px 0;
    padding: 15px;
    background-color: #fef0f0;
    border-radius: 8px;
    text-align: left;
    
    h3 {
      margin-top: 0;
      color: #f56c6c;
      font-size: 16px;
    }
    
    p {
      margin-bottom: 0;
      font-size: 14px;
      line-height: 1.6;
    }
  }
  
  .action-buttons {
    margin-top: 20px;
  }
}

.article-pending {
  background-color: var(--defaultColor);
}

.md-editor-catalog {
  position: sticky;
  top: 100px;
  max-height: 80vh;
  overflow-y: auto;
}
.article_content {
  min-height: 400px;
  padding: 25px 10px;
  background-color: var(--defaultColor);
  border-radius: 11px;

  .article_title {
    text-align: center;
  }

  .article_info {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    margin: 15px 0;

    & > div {
      display: inline-flex;
      margin: 10px;
      align-items: center;

      :deep(.el-icon) {
        margin-right: 5px;
      }
    }
  }

  .content {
    font-size: 16px;
    color: #444;

    .md-previewOnly {
      font-family: "Noto Serif SC", "Source Han Serif SC", "Source Han Serif",
        source-han-serif-sc, "PT Serif", "SongTi SC", "MicroSoft Yahei", Georgia,
        serif;
    }
  }
}

@media screen and (max-width: 768px) {
  .article_content {
    font-size: 1.8rem;

    .article_info {
      & > div {
        margin-right: auto;
      }
    }
  }
}
</style>

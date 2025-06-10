import type { ArticleErrorType, ArticleType } from "~/types/article";
import type { ResponseData } from "~/types/common";

interface selectArticleDataType {
  page?: number;
  offset?: number;
  keyword?: string;
  field?: string;
}

const API_PREFIX = "/article";

// 更新文章访问量
export const updateArticleWatch = <T>(
  id: string,
  data: { article_watch: number }
) => {
  return useRequest<T>({
    url: API_PREFIX + "/update/" + id,
    data,
    method: "PATCH",
  });
};

export interface UpdateArticleDTO {
  title?: string;
  content?: string;
  description?: string;
  type_id?: string | number;
  tags?: string[];
  pic?: string;
  author_id?: string | number;
}
// 更新文章内容
export const updateArticle = <T>(
  id: string,
  data: UpdateArticleDTO
) => {
  return useRequest<T>({
    url: API_PREFIX + "/" + id,
    data,
    method: "PUT",
  });
};

/**
 * 获取时间线
 * @returns
 */
export const getArticleTimeline = <T>() => {
  return useRequest<T>({
    url: API_PREFIX + "/timeline",
    method: "GET",
  });
};

type SelectArticle = {
  rows: Array<ArticleType>;
  count: number;
};

/**
 * 查询文章
 * @param data
 * @returns
 */
export const selectArticle = (
  data: selectArticleDataType = { page: 1, offset: 5 },
  lazy: boolean = true
) => {
  const params: selectArticleDataType = {};

  for (const key in data) {
    if (data[key]) {
      params[key] = data[key];
    }
  }

  return useRequest<SelectArticle>(
    {
      url: API_PREFIX + "s",
      method: "GET",
      params: params,
    },
    lazy
  );
};

/**
 * 获取文章详情
 * @param id
 * @param params
 * @returns
 */
export const getArticleDetail = (id: string, params?: {
  isEdit?: 0 | 1;
}) => {
  return useRequest<ResponseData<ArticleType | ArticleErrorType>>({
    url: API_PREFIX + "/" + id,
    method: "GET",
    params,
  });
};

export type AddArticle = {
  author_id: number;
  title: string;
  type_id: number;
  description: string;
  pic: string;
  content: string;
  tags: string[];
};

/**
 * 添加文章
 * @param data
 * @returns
 */
export const addArticle = (data: AddArticle) => {
  return useRequest({
    url: API_PREFIX,
    method: "POST",
    data,
  });
};

type PageType = {
  page?: number;
  offset?: number;
  order?: "DESC" | "ASC";
};

type GetArticleByTagIdType = PageType & {
  tagId: number;
};
/**
 * 根据标签id获取关联的文章
 * @param params
 * @returns
 */
export const getArticleByTagId = (params: GetArticleByTagIdType) => {
  return useRequest<ResponseData<ArticleType>>({
    url: API_PREFIX + "/tag/" + params.tagId,
    method: "GET",
    params,
  });
};

export type GetArticleByUidType = PageType & {
  uid: number;
  is_approved?: -1 | 0 | 1 | 2; // -1: 全部, 0: 待审核, 1: 审核中, 2: 审核通过, 3: 审核不通过
};
/**
 * 根据用户id获取关联的文章
 * @param params
 * @returns
 */
export const getArticleByUid = (params: GetArticleByUidType) => {
  return useRequest<ResponseData<ArticleType>>({
    url: API_PREFIX + "/user/" + params.uid,
    method: "GET",
    params,
  });
};

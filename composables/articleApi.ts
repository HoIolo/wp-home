interface selectArticleDataType {
  page?: number;
  offset?: number;
  keyword?: string;
}

const API_PREFIX = "/article";

export const updateArticle = <T>(
  id: string,
  data: { article_watch: number }
) => {
  return useReqTs<T>({
    url: API_PREFIX + "/update/" + id,
    data,
    method: "PATCH",
  });
};

/**
 * 获取时间线
 * @returns
 */
export const getArticleTimeline = <T>() => {
  return useReqTs<T>({
    url: API_PREFIX + "/timeline",
    method: "GET",
  });
};

/**
 * 查询文章
 * @param data
 * @returns
 */
export const selectArticle = (
  data: selectArticleDataType = { page: 1, offset: 5 }
) => {
  const params: selectArticleDataType = {};

  for (const key in data) {
    if (data[key]) {
      params[key] = data[key];
    }
  }

  return useRequest({
    url: API_PREFIX + "s",
    method: "GET",
    params: params,
  });
};

/**
 * 获取文章详情
 * @param id
 * @returns
 */
export const getArticleDetail = (id: string) => {
  return useRequest({
    url: API_PREFIX + "/" + id,
    method: "GET",
  });
};

type AddArticle = {
  author_id: number;
  title: string;
  type: string;
  description: string;
  pic: string;
  content: string;
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

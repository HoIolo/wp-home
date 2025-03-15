import type { PageParams, ResponseData } from "~/types/common";
import type { WebsiteSetting } from "~/types/websiteSetting";

export type GetWebsiteSettingParams = PageParams & {};

/**
 * 获取网站配置
 */
export const getWebsiteSetting = (params?: GetWebsiteSettingParams) => {
  return useRequest<ResponseData<WebsiteSetting>>({
    url: "/website/setting",
    method: "GET",
    params,
  });
};

export type PostIncrementVisitorCountData = {
  date: string; // 日期 [YYYY MM DD]
  count: number;
};

/**
 * 增加网站访问次数
 */
export const postIncrementVisitorCount = (data: PostIncrementVisitorCountData) => {
  return useRequest<ResponseData<any>>({
    url: "/website/visitor/increment",
    method: "POST",
    data
  });
};

import { dayjs, type MessageParams } from "element-plus";
import type { AiType } from "~/api/aiApi";

export const useCatch = <T>(fn: Promise<T>) => {
  return fn
    .then((res: T) => {
      return [null, res];
    })
    .catch((err) => {
      return [err, null];
    });
};

/**
 * 图片懒加载
 * @param imgs
 */
export const useLazyLoadImage = (imgs: NodeListOf<HTMLImageElement>) => {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((item) => {
      if (item.isIntersecting) {
        const imgElement = item.target as HTMLImageElement;
        imgElement.src = imgElement.dataset.src;
        io.unobserve(imgElement);
      }
    });
  });
  imgs.forEach((img) => {
    io.observe(img);
  });
};

let currentMessage = null;
/**
 * 自定义消息提示
 * @param options
 */
export const useMessage = (options: MessageParams) => {
  if (currentMessage) {
    currentMessage.close();
  }
  const message = ElMessage(Object.assign({ offset: 80 }, options));

  currentMessage = message;
};

type transformParam = {
  url: string;
  options: transformOptions;
};
type transformOptions = {
  width?: number;
  quality?: number;
  height?: number;
  widthAndHeight?: string;
};
/**
 * 又拍云储存服务转化图片url
 * @param url
 * @param options
 * @returns
 */
export const transformUpYunPicUrl = (params: transformParam) => {
  const domain = "cloud.hoiolo.cn";
  const { url, options } = params;
  function splicingParam(param: string | number, splice: string) {
    return param ? splice + param : "";
  }
  if (url.includes(domain) && !url.includes("!")) {
    return (
      url +
      `!v1/format/webp${splicingParam(options.width, "/fw/")}${splicingParam(
        options.quality,
        "/quality/"
      )}${splicingParam(options.height, "/fh/")}${splicingParam(
        options.widthAndHeight,
        "/both/"
      )}`
    );
  }
  return url;
};

/**
 * 图片骨架屏懒加载
 * @param observeEl
 * @param imgEl
 * @param callback
 */
export const imageSkeletonLazyLoad = (
  observeEl: HTMLDivElement,
  imgEl: HTMLImageElement,
  callback: any
) => {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((item) => {
        if (item.isIntersecting) {
          io.unobserve(observeEl);
          callback(imgEl.dataset.src);
        }
      });
    },
    { threshold: 0.5 }
  );
  io.observe(observeEl);
};

/**
 *  防抖函数
 * @param func
 * @param delay
 * @returns
 */
export const debounce = (func, delay) => {
  let timeoutId;

  return function (...args) {
    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      func(args);
    }, delay);
  };
};

/**
 * 格式化日期
 * @param createdAt
 */
export function formatRelativeTime(createdAt, dateFormat = "YYYY-MM-DD") {
  const now = new Date();
  const createdDate = new Date(createdAt);

  const timeDifferenceInSeconds = Math.floor(
    ((now as any) - (createdDate as any)) / 1000
  );

  if (timeDifferenceInSeconds < 60) {
    return `刚刚`;
  } else if (timeDifferenceInSeconds < 3600) {
    const minutesAgo = Math.floor(timeDifferenceInSeconds / 60);
    return `${minutesAgo}分钟前`;
  } else if (timeDifferenceInSeconds < 86400) {
    const hoursAgo = Math.floor(timeDifferenceInSeconds / 3600);
    return `${hoursAgo}小时前`;
  } else if (timeDifferenceInSeconds < 259200) {
    const daysAgo = Math.floor(timeDifferenceInSeconds / 86400);
    return `${daysAgo}天前`;
  } else {
    // 如果超过3天，则显示日期
    return dayjs(createdDate).format(dateFormat);
  }
}

/**
 * 随机获取数组中的字符串
 * @param array
 * @returns
 */
export const getRandomArrayString = (
  array: string[] = ["info", "success", "warning", "danger"]
): any => {
  return array[Math.floor(Math.random() * array.length)];
};

/**
 * 解析sse方式ai返回的响应
 * @param res
 * @returns
 */
export const parseSSEAIResToObj = (res: string) => {
  if (!res || !res.includes("data")) return null;
  const resultStr = res.split("data")[1].slice(1);
  const resultObj = JSON.parse(resultStr);
  return resultObj;
};

/**
 * 获取sse方式ai返回的回复
 * @param res
 * @returns
 */
export const getSSEAiReply = (ai: AiType) => {
  const aiResParseMap = {
    TY: {
      parseJson: (val) => parseSSEAIResToObj(val),
      getContent: (data) => data.output.text,
    },
    KIMI: {
      parseJson: (val) => JSON.parse(val.replace("data: ", "")),
      getContent: (data) => data.choices[0].delta.content,
    },
    SF: {
      parseJson: (val) => {
        val = val?.replace("data: ", "");
        if (val === "[DONE]") return null;
        return JSON.parse(val.replace("data: ", ""));
      },
      getReasoningContent: (data) => data?.choices?.[0]?.delta?.reasoning_content,
      getContent: (data) => {
        if (!data) return null;
        return data?.choices?.[0]?.delta?.content;
      },
    },
  };

  return aiResParseMap[ai];
};

/**
 * 处理sse方式ai返回的响应
 * @param response
 * @param ai
 * @param callback
 * @returns
 */
export const handleAiSSERes = async (
  response: Response,
  ai: AiType,
  callback: (content: string, responseData: any) => void
) => {
  const reader = (response as any).body.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    let result = new TextDecoder().decode(value, { stream: true });
    const aiObj = getSSEAiReply(ai);

    const lines = result.split("\n").filter((line) => line.trim() !== "");

    lines.forEach((line) => {
      try {
        const dataObj = aiObj.parseJson(line);
        callback(aiObj.getContent(dataObj) || "", dataObj);
      } catch (e) {}
    });
  }
};

function kimiAiParser(res: string) {
  const lines = res.split("\n").filter((line) => line.trim() !== "");

  lines.forEach((line) => {
    if (line.startsWith("data: ")) {
      const jsonData = line.replace("data: ", "");
      try {
        const parsedResponse = JSON.parse(jsonData);
      } catch (e) {
        console.error("Failed to parse JSON", e);
      }
    }
  });
}

import { TagType } from './tag.d';
import { User } from "./user";
import { CommonEntity } from "./common";

export interface ArticleData {
  rows: Array<ArticleType>;
  count: number;
}

export interface ArticleTypeType extends CommonEntity {
  name: string;
}

export interface ArticleType {
  id: number;
  author: User;
  comment_num: number;
  content: string;
  createTime: string;
  deleteAt: string;
  description: string;
  pic: string;
  publish_date: string;
  title: string;
  type: ArticleTypeType;
  updatedTime: string;
  watch_num: number;
  tags: string[];
  is_approved: 0 | 1 | 2 | 3; // 0: 待审核, 1: 审核中, 2: 审核通过, 3: 审核不通过
  tagsEntity: TagType[];
  reject_reason?: string;
}

export interface ArticleErrorType {
  status: number;
  message: string;
  reason: string;
}


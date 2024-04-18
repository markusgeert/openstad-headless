import {Comment} from '@openstad-headless/types';

export type CommentFormProps = {
  comment?: Comment;
  descriptionMinLength?: number;
  descriptionMaxLength?: number;
  placeholder?: string;
  formIntro?: string;
  parentId?: number;
  submitComment: (e: any) => void;
};

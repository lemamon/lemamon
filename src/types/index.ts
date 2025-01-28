export type PostContent =
  | {
      type: "text";
      content: string;
    }
  | {
      type: "code";
      language: string;
      content: string;
    }
  | {
      type: "image";
      url: string;
      alt: string;
      caption?: string;
    }
  | {
      type: "video";
      url: string;
      poster?: string;
    }
  | {
      type: "callout";
      style: "info" | "warning" | "error" | "success";
      title: string;
      content: string;
    }
  | {
      type: "list";
      style: "ordered" | "unordered";
      items: string[];
    }
  | {
      type: "blockquote";
      content: string;
      author?: string;
      role?: string;
    }
  | {
      type: "table";
      headers: string[];
      rows: string[][];
    }
  | {
      type: "checklist";
      title: string;
      items: { text: string; checked: boolean }[];
    }
  | {
      type: "codepen";
      url: string;
      height?: number;
    }
  | {
      type: "figure";
      url: string;
      alt: string;
      caption?: string;
    };

export type PostSeries = {
  name: string;
  part: number;
};

export type Post = {
  id: number;
  title: string;
  author: string;
  date: string;
  category: string;
  readingTime: string;
  excerpt: string;
  content: PostContent[];
  tags: string[];
  relatedPosts: number[];
  series?: PostSeries;
};

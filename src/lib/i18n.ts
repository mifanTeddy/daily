import type { Difficulty, FeedTab, LanguageCode } from "@/lib/types";

export const DEFAULT_LANGUAGE: LanguageCode = "zh";

const dictionary = {
  zh: {
    nav: {
      home: "首页",
      discover: "发现",
      bookmarks: "收藏"
    },
    feed: {
      tabAria: "信息流类型",
      tabs: {
        recommended: "推荐",
        latest: "最新",
        following: "关注"
      },
      title: {
        recommended: "为你推荐",
        latest: "最新上架",
        following: "关注主题"
      },
      subtitle: "每日精选技术内容，保持信息密度，不灌水。",
      empty: "当前筛选下暂无内容，试试切换主题或标签。",
      loadMore: "加载更多",
      loading: "加载中..."
    },
    discover: {
      title: "发现",
      allSubtitle: "按综合质量排序，优先展示值得精读的内容。",
      topicPrefix: "当前筛选："
    },
    bookmarks: {
      title: "我的收藏",
      subtitle: "集中查看你保存的文章。",
      empty: "还没有收藏内容，去首页或发现页试试。"
    },
    article: {
      notFound: "文章不存在，返回首页继续阅读。",
      read: "已读",
      markRead: "标记已读",
      saved: "已收藏",
      save: "收藏",
      original: "原文",
      openOriginal: "打开原文",
      backHome: "返回首页",
      related: "相关推荐",
      readTimeSuffix: "分钟阅读",
      metaMinute: "分钟",
      heat: "热度",
      difficulty: "难度"
    },
    sidebar: {
      rhythmTitle: "今日节奏",
      rhythmDesc: "高质量技术内容，按质量与时效混排。先刷 10 分钟，再决定深读。",
      hotTopics: "热门话题",
      sourceTitle: "内容来源",
      sourceDesc: "数据由后端 API 提供，支持双语文章读取与上传。"
    },
    common: {
      allTopics: "全部",
      switchLang: "EN"
    }
  },
  en: {
    nav: {
      home: "Home",
      discover: "Discover",
      bookmarks: "Bookmarks"
    },
    feed: {
      tabAria: "Feed tabs",
      tabs: {
        recommended: "Recommended",
        latest: "Latest",
        following: "Following"
      },
      title: {
        recommended: "Recommended For You",
        latest: "Latest",
        following: "Following Topics"
      },
      subtitle: "Curated tech content with high signal and low noise.",
      empty: "No content under this filter. Try another topic or tab.",
      loadMore: "Load more",
      loading: "Loading..."
    },
    discover: {
      title: "Discover",
      allSubtitle: "Ranked by overall quality for deep reads.",
      topicPrefix: "Current topic: "
    },
    bookmarks: {
      title: "Bookmarks",
      subtitle: "All articles you saved in one place.",
      empty: "No bookmarks yet. Save some from Home or Discover."
    },
    article: {
      notFound: "Article not found. Return to home and continue reading.",
      read: "Read",
      markRead: "Mark read",
      saved: "Saved",
      save: "Save",
      original: "Source",
      openOriginal: "Open source",
      backHome: "Back to home",
      related: "Related",
      readTimeSuffix: "min read",
      metaMinute: "min",
      heat: "Heat",
      difficulty: "Level"
    },
    sidebar: {
      rhythmTitle: "Daily Rhythm",
      rhythmDesc: "High-quality tech reads mixed by quality and freshness.",
      hotTopics: "Hot Topics",
      sourceTitle: "Content Source",
      sourceDesc: "Data is provided by backend APIs with bilingual read and upload support."
    },
    common: {
      allTopics: "All",
      switchLang: "中文"
    }
  }
} as const;

export function t(language: LanguageCode) {
  return dictionary[language];
}

export function getDifficultyLabel(language: LanguageCode, difficulty: Difficulty): string {
  const labels = {
    zh: {
      beginner: "初级",
      intermediate: "中级",
      advanced: "高级"
    },
    en: {
      beginner: "Beginner",
      intermediate: "Intermediate",
      advanced: "Advanced"
    }
  } as const;

  return labels[language][difficulty];
}

export function getTabLabel(language: LanguageCode, tab: FeedTab): string {
  return dictionary[language].feed.tabs[tab];
}

export function getLanguageLocale(language: LanguageCode): string {
  return language === "zh" ? "zh-CN" : "en-US";
}

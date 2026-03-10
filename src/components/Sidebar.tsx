import type { TopicMeta } from "@/lib/types";

export function Sidebar(props: {
  topics: TopicMeta[];
}) {
  const { topics } = props;

  return (
    <aside className="sidebar">
      <section className="side-card">
        <h2>今日节奏</h2>
        <p>高质量中文技术内容，按质量与时效混排。先刷 10 分钟，再决定深读。</p>
      </section>

      <section className="side-card">
        <h2>热门话题</h2>
        <ul>
          {topics.slice(1, 7).map((topic) => (
            <li key={topic.name}>
              <span>{topic.name}</span>
              <span>{topic.count}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="side-card side-note">
        <h2>OpenClaw 对接预留</h2>
        <p>
          当前页面由 mock API 提供内容。后续把 `getFeed/getTopics/getArticleById` 替换成你的真实后端接口即可。
        </p>
      </section>
    </aside>
  );
}

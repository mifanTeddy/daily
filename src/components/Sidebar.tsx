"use client";

import { useLanguage } from "@/components/LanguageProvider";
import { t } from "@/lib/i18n";
import type { TopicMeta } from "@/lib/types";

export function Sidebar(props: {
  topics: TopicMeta[];
}) {
  const { topics } = props;
  const { language } = useLanguage();
  const copy = t(language);

  return (
    <aside className="sidebar">
      <section className="side-card">
        <h2>{copy.sidebar.rhythmTitle}</h2>
        <p>{copy.sidebar.rhythmDesc}</p>
      </section>

      <section className="side-card">
        <h2>{copy.sidebar.hotTopics}</h2>
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
        <h2>{copy.sidebar.sourceTitle}</h2>
        <p>{copy.sidebar.sourceDesc}</p>
      </section>
    </aside>
  );
}

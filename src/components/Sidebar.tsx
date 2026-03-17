"use client";

import { useLanguage } from "@/components/LanguageProvider";
import { t } from "@/lib/i18n";
import type { TopicOption } from "@/lib/types";

export function Sidebar(props: {
  topics: Array<TopicOption & { active: boolean }>;
  onTopicSelect: (topic: string) => void;
}) {
  const { topics, onTopicSelect } = props;
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
            <li key={topic.value}>
              <button
                type="button"
                onClick={() => onTopicSelect(topic.value)}
                className={topic.active ? "side-topic-button active" : "side-topic-button"}
                aria-pressed={topic.active}
              >
                <span>{topic.label}</span>
                <span>{topic.count}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}

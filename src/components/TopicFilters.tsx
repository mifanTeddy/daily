"use client";

import type { TopicMeta } from "@/lib/types";

export function TopicFilters(props: {
  topics: TopicMeta[];
  active: string;
  onChange: (topic: string) => void;
}) {
  const { topics, active, onChange } = props;

  return (
    <div className="topic-row">
      {topics.map((topic) => (
        <button
          type="button"
          key={topic.name}
          onClick={() => onChange(topic.name)}
          className={active === topic.name ? "topic-pill active" : "topic-pill"}
        >
          {topic.name}
          <span>{topic.count}</span>
        </button>
      ))}
    </div>
  );
}

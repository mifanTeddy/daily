"use client";

import type { TopicOption } from "@/lib/types";

export function TopicFilters(props: {
  topics: TopicOption[];
  active: string;
  onChange: (topic: string) => void;
}) {
  const { topics, active, onChange } = props;

  return (
    <div className="topic-row">
      {topics.map((topic) => (
        <button
          type="button"
          key={topic.value}
          onClick={() => onChange(topic.value)}
          className={active === topic.value ? "topic-pill active" : "topic-pill"}
        >
          {topic.label}
          <span>{topic.count}</span>
        </button>
      ))}
    </div>
  );
}

import { ArticleDetailClient } from "@/components/ArticleDetailClient";

export default function ArticlePage(props: { params: { id: string } }) {
  return <ArticleDetailClient id={props.params.id} />;
}

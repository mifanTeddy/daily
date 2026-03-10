import { getLanguageLocale } from "@/lib/i18n";
import type { LanguageCode } from "@/lib/types";

export function formatDate(value: string, language: LanguageCode): string {
  return new Intl.DateTimeFormat(getLanguageLocale(language), {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

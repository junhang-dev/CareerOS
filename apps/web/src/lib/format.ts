const dateTimeFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "short",
  day: "numeric"
});

export function formatDate(value?: string) {
  if (!value) {
    return "-";
  }

  return dateTimeFormatter.format(new Date(value));
}


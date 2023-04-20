export function formatTime(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  const millisecond = date.getMilliseconds();
  return `${year.toString().padStart(4, "0")}/${month
    .toString()
    .padStart(2, "0")}/${day.toString().padStart(2, "0")} ${hour
    .toString()
    .padStart(2, "0")}:${minute.toString().padStart(2, "0")}:${second
    .toString()
    .padStart(2, "0")}.${millisecond.toString().padStart(3, "0")}`;
}

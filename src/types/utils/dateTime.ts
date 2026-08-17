export function formatChatListTime(timestamp: number) {
  const date = new Date(timestamp);
  const now = new Date();

  const isToday =
    date.toDateString() === now.toDateString();

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);

  const isYesterday =
    date.toDateString() === yesterday.toDateString();

  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) /
      (1000 * 60 * 60 * 24)
  );

  if (isToday) {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (isYesterday) {
    return "Yesterday";
  }

  if (diffDays < 7) {
    return date.toLocaleDateString([], {
      weekday: "long",
    });
  }

  return date.toLocaleDateString([], {
    day: "2-digit",
    month: "short",
    year:"numeric"
  });
}

export function formatChatDate(timestamp: number) {
  const date = new Date(timestamp);

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isToday =
    date.toDateString() === today.toDateString();

  const isYesterday =
    date.toDateString() === yesterday.toDateString();

  if (isToday) {
    return "Today";
  }

  if (isYesterday) {
    return "Yesterday";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year:
      date.getFullYear() !== today.getFullYear()
        ? "numeric"
        : undefined,
  });
}


export function formatLastSeen(timestamp: number) {
  const date = new Date(timestamp);

  const now = new Date();

  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const msgDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  const time = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (msgDay.getTime() === today.getTime()) {
    return `Last seen today at ${time}`;
  }

  if (msgDay.getTime() === yesterday.getTime()) {
    return `Last seen yesterday at ${time}`;
  }

  const diff =
    (today.getTime() - msgDay.getTime()) /
    (1000 * 60 * 60 * 24);

  if (diff < 7) {
    return `Last seen ${date.toLocaleDateString([], {
      weekday: "long",
    })} at ${time}`;
  }

  // Manual date formatting
  const day = date
    .getDate()
    .toString()
    .padStart(2, "0");

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `Last seen ${day} ${month} ${year} at ${time}`;
}

export function getMessageDateLabel(timestamp: number) {
  const date = new Date(timestamp);

  const now = new Date();

  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const msgDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  if (msgDay.getTime() === today.getTime()) {
    return "Today";
  }

  if (msgDay.getTime() === yesterday.getTime()) {
    return "Yesterday";
  }

  const diff =
    (today.getTime() - msgDay.getTime()) /
    (1000 * 60 * 60 * 24);

  if (diff < 7) {
    return date.toLocaleDateString([], {
      weekday: "long",
    });
  }

  return date.toLocaleDateString();
}
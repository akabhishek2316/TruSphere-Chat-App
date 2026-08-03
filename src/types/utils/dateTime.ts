export function formatChatListTime(timestamp: number) {
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
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
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

  return `Last seen ${date.toLocaleDateString()} ${time}`;
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
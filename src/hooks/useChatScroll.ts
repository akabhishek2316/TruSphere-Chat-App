import { useRef } from "react";
import { FlatList } from "react-native";

export default function useChatScroll() {
  const listRef = useRef<FlatList>(null);

  // User currently bottom ke paas hai ya nahi
  const shouldAutoScroll = useRef(true);

  // User apne haath se scroll kar raha hai
  const isUserScrolling = useRef(false);

  const scrollToBottom = (animated = true) => {
    if (!shouldAutoScroll.current) return;

    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({
        animated,
      });
    });
  };

  return {
    listRef,
    scrollToBottom,
    shouldAutoScroll,
    isUserScrolling,
  };
}
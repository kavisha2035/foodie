import { useInfiniteQuery } from "@tanstack/react-query";
import { getFeed } from "../api/feed.api";

export const useFeed = () => {
  return useInfiniteQuery({
    queryKey: ["feed"],
    queryFn: ({ pageParam }) => getFeed(pageParam),
    initialPageParam: null,
    getNextPageParam: (lastPage) => {
      const pagination = lastPage.data.pagination;
      return pagination?.nextCursor || undefined;
    },
  });
};

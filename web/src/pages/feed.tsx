import { useInfiniteQuery } from "@tanstack/react-query";
import { useScroll } from "framer-motion";
import { useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";

import ImageList from "../components/Layout/ImageList";
import useAuthRedirect from "../hooks/useAuthRedirect";
import useDebounce from "../hooks/useDebounce";
import { searchPosts } from "../requests/fetch";

interface Props {
  searchValue: string;
}

export default function Feed({ searchValue }: Props) {
  //#region Hooks

  useAuthRedirect();

  const { scrollYProgress } = useScroll();

  const debouncedSearchValue = useDebounce(searchValue, 250);

  const {
    data: infinitePostsData,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["feed_posts", { search: debouncedSearchValue }],
    queryFn: ({ pageParam = "" }) =>
      searchPosts({
        search: searchValue,
        limit: 32,
        cursorId: pageParam as string,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursorId,
    onError: (err: Error) => {
      toast.error(err.message);
    },
    refetchOnMount: "always", // Refetch on mount regardless of staleness (e.g. if the user navigates back to the feed from another route)
    staleTime: Infinity, // Never stale. Prevents unexpected layout shifts when the post order changes while navigating the feed
  });

  const posts = useMemo(() => {
    return infinitePostsData?.pages.map((page) => page.posts).flat() ?? [];
  }, [infinitePostsData]);

  useEffect(() => {
    return scrollYProgress.onChange((progress) => {
      if (progress > 0.6 && !isFetchingNextPage && hasNextPage) {
        void fetchNextPage();
      }
    });
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, scrollYProgress]);

  //#endregion

  return (
    <main className={"h-screen"}>
      <ImageList
        arePostsLoading={isFetching && !isFetchingNextPage}
        areMorePostsLoading={isFetchingNextPage}
        posts={posts}
        className={"px-2 py-16 sm:px-4 md:pb-8 lg:px-8"}
      />
    </main>
  );
}

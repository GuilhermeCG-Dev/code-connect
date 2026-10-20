import type { PostSummary } from '../services/posts'

// Optimistic copy of a post after the viewer likes or unlikes it
export function toggleLike<T extends PostSummary>(post: T): T {
  return {
    ...post,
    likedByMe: !post.likedByMe,
    likesCount: post.likesCount + (post.likedByMe ? -1 : 1),
  }
}

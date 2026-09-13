import type { CreatePostInput, Post } from "../types/post";

const API_BASE = "/api";

export const postRepository = {
  async getPosts(): Promise<Post[]> {
    const response = await fetch(`${API_BASE}/posts`);
    const { posts } = (await response.json()) as { posts: Post[] };
    return posts;
  },

  async createPost(input: CreatePostInput): Promise<{ post?: Post; error?: string }> {
    const response = await fetch(`${API_BASE}/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    const data = (await response.json()) as { post?: Post; error?: string };

    if (!response.ok) {
      return { error: data.error ?? "No se pudo publicar la noticia." };
    }

    return { post: data.post };
  },

  async deletePost(id: string): Promise<{ ok?: boolean; error?: string }> {
    const response = await fetch(`${API_BASE}/posts/${id}`, { method: "DELETE" });
    const data = (await response.json()) as { ok?: boolean; error?: string };

    if (!response.ok) {
      return { error: data.error ?? "No se pudo eliminar la noticia." };
    }

    return { ok: true };
  },

  async uploadImage(file: File): Promise<{ url?: string; error?: string }> {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(`${API_BASE}/posts/upload-image`, {
      method: "POST",
      body: formData,
    });

    const data = (await response.json()) as { url?: string; error?: string };

    if (!response.ok) {
      return { error: data.error ?? "No se pudo subir la imagen." };
    }

    return { url: data.url };
  },
};

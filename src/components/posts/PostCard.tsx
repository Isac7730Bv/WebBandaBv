import { useEffect, useRef, useState } from "react";

import type { Post } from "../../types/post";

import "./PostCard.css";

const COLLAPSED_MAX_HEIGHT = 220; // px

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-BO", { year: "numeric", month: "long", day: "numeric" });
}

interface PostCardProps {
  post: Post;
}

function PostCard({ post }: PostCardProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [needsToggle, setNeedsToggle] = useState(false);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    // Medimos la altura real del contenido para decidir si hace falta el
    // botón "Leer más" (si ya cabe completo, no lo mostramos).
    setNeedsToggle(el.scrollHeight > COLLAPSED_MAX_HEIGHT + 8);
  }, [post.content]);

  const isCollapsed = needsToggle && !expanded;

  return (
    <article className="post-card">
      <header className="post-card__header">
        <h3 className="post-card__title">{post.title}</h3>
        <time className="post-card__date" dateTime={post.createdAt}>
          {formatDate(post.createdAt)}
        </time>
      </header>

      <div
        ref={contentRef}
        className={`post-card__content ${isCollapsed ? "post-card__content--collapsed" : ""}`}
        // El contenido lo escribe el propio administrador con el editor de
        // noticias; el backend además le quita <script> y atributos "on*"
        // antes de guardarlo.
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {needsToggle && (
        <button type="button" className="post-card__toggle" onClick={() => setExpanded((current) => !current)}>
          {expanded ? "Leer menos" : "Leer más"}
        </button>
      )}
    </article>
  );
}

export default PostCard;

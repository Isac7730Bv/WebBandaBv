import { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";

import ProfileSidebar from "../components/profile/ProfileSidebar";
import RichTextEditor, { type RichTextEditorHandle } from "../components/posts/RichTextEditor";
import { authRepository } from "../repositories/authRepository";
import { postRepository } from "../repositories/postRepository";
import type { Post } from "../types/post";

import "./ProfilePage.css";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-BO", { year: "numeric", month: "short", day: "numeric" });
}

function AdminPostsPage() {
  const user = authRepository.getCurrentUser();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [title, setTitle] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [rowError, setRowError] = useState<{ id: string; message: string } | null>(null);

  const editorRef = useRef<RichTextEditorHandle>(null);

  const loadPosts = () => {
    setLoading(true);
    setLoadError("");
    postRepository
      .getPosts()
      .then((data) => {
        setPosts(data);
        setLoading(false);
      })
      .catch(() => {
        setLoadError("No se pudieron cargar las noticias. Verifica que el servidor esté actualizado y en ejecución, y vuelve a intentar.");
        setLoading(false);
      });
  };

  useEffect(() => {
    loadPosts();
  }, []);

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "ADMIN") return <Navigate to="/perfil-usuario" replace />;

  const handlePublish = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    const content = editorRef.current?.getHtml() ?? "";

    if (!title.trim()) {
      setFormError("Ponle un título a la noticia.");
      return;
    }

    if (editorRef.current?.isEmpty()) {
      setFormError("Escribe algo en el texto de la noticia (o agrega una imagen/video).");
      return;
    }

    setSaving(true);
    const result = await postRepository.createPost({ title: title.trim(), content });
    setSaving(false);

    if (result.error) {
      setFormError(result.error);
      return;
    }

    setTitle("");
    editorRef.current?.clear();
    loadPosts();
  };

  const handleDelete = async (post: Post) => {
    setRowError(null);
    const result = await postRepository.deletePost(post.id);

    if (result.error) {
      setRowError({ id: post.id, message: result.error });
      return;
    }

    loadPosts();
  };

  return (
    <main className="profile-page">
      <div className="profile-layout">
        <ProfileSidebar user={user} />
        <section className="profile-content">
          <header className="profile-content__header">
            <p className="profile-page__eyebrow">Administración</p>
            <h1 className="profile-page__title">Noticias</h1>
            <p className="profile-page__description">
              Publica noticias en la página principal: las verá cualquiera que entre a la
              aplicación, esté o no logueado.
            </p>
          </header>

          <form className="student-form" onSubmit={handlePublish} style={{ marginBottom: "1.5rem" }}>
            <label>
              Título
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Ej: ¡Ganamos el concurso interescolar!"
                required
              />
            </label>
            <div className="student-form__full">
              <label>Texto (puedes agregar imágenes y video)</label>
              <RichTextEditor ref={editorRef} />
            </div>
            {formError && <p className="student-form__error" role="alert">{formError}</p>}
            <div className="student-form__actions">
              <button className="profile-page__button" type="submit" disabled={saving}>
                {saving ? "Publicando..." : "Publicar noticia"}
              </button>
            </div>
          </form>

          <section className="attendance students-list" aria-labelledby="posts-list-title">
            <h2 id="posts-list-title">
              {posts.length} noticia{posts.length === 1 ? "" : "s"}
            </h2>

            {loadError ? (
              <p className="student-form__error" role="alert">
                {loadError}{" "}
                <button type="button" className="profile-page__button" onClick={loadPosts} style={{ marginLeft: "0.5rem" }}>
                  Reintentar
                </button>
              </p>
            ) : loading ? (
              <p className="attendance__empty">Cargando...</p>
            ) : posts.length === 0 ? (
              <p className="attendance__empty">Todavía no se ha publicado ninguna noticia.</p>
            ) : (
              <div className="attendance__table-wrap">
                <table className="attendance__table">
                  <thead>
                    <tr>
                      <th>Título</th>
                      <th>Fecha</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map((post) => (
                      <tr key={post.id}>
                        <td>{post.title}</td>
                        <td>{formatDate(post.createdAt)}</td>
                        <td>
                          <div className="attendance__status-options">
                            <button
                              className="student-status student-status--inactive"
                              type="button"
                              onClick={() => handleDelete(post)}
                            >
                              Eliminar
                            </button>
                          </div>
                          {rowError?.id === post.id && (
                            <p className="student-form__error" role="alert">{rowError.message}</p>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}

export default AdminPostsPage;

import { forwardRef, useImperativeHandle, useRef, useState } from "react";

import { postRepository } from "../../repositories/postRepository";
import { getEmbedInfo } from "../../utils/mediaEmbed";

import "./RichTextEditor.css";

export interface RichTextEditorHandle {
  getHtml: () => string;
  isEmpty: () => boolean;
  clear: () => void;
  focus: () => void;
}

// Editor de texto enriquecido hecho a mano (sin librerías externas):
// permite negrita, cursiva, listas, insertar imágenes (se suben al
// servidor) e insertar video (enlace de YouTube o Google Drive, con la
// misma lógica que la sección de Multimedia). El HTML resultante se lee
// con getHtml() cuando el formulario se envía; no es un componente
// "controlado" de React porque contentEditable no se lleva bien con eso.
const RichTextEditor = forwardRef<RichTextEditorHandle>((_props, ref) => {
  const editableRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState("");

  const [showVideoInput, setShowVideoInput] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoError, setVideoError] = useState("");

  useImperativeHandle(ref, () => ({
    getHtml: () => editableRef.current?.innerHTML.trim() ?? "",
    isEmpty: () => {
      const text = editableRef.current?.textContent?.trim() ?? "";
      const hasMedia = /<img|<iframe/i.test(editableRef.current?.innerHTML ?? "");
      return text.length === 0 && !hasMedia;
    },
    clear: () => {
      if (editableRef.current) editableRef.current.innerHTML = "";
    },
    focus: () => editableRef.current?.focus(),
  }));

  const runCommand = (command: string) => {
    editableRef.current?.focus();
    document.execCommand(command);
  };

  const insertHtmlAtCursor = (html: string) => {
    editableRef.current?.focus();
    document.execCommand("insertHTML", false, html);
  };

  const handleImageButtonClick = () => {
    setImageError("");
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploadingImage(true);
    setImageError("");
    const result = await postRepository.uploadImage(file);
    setUploadingImage(false);

    if (result.error || !result.url) {
      setImageError(result.error ?? "No se pudo subir la imagen.");
      return;
    }

    insertHtmlAtCursor(
      `<img src="${result.url}" alt="" style="max-width:100%;border-radius:0.6rem;margin:0.5rem 0;" />`,
    );
  };

  const handleInsertVideo = () => {
    setVideoError("");
    const trimmed = videoUrl.trim();

    if (!trimmed) {
      setVideoError("Pega un enlace de YouTube o Google Drive.");
      return;
    }

    const embed = getEmbedInfo(trimmed);

    if (embed.kind === "youtube" || embed.kind === "drive") {
      insertHtmlAtCursor(
        `<div class="rte-video-wrap" contenteditable="false"><iframe src="${embed.embedUrl}" allowfullscreen></iframe></div><p><br></p>`,
      );
    } else {
      insertHtmlAtCursor(
        `<p><a href="${trimmed}" target="_blank" rel="noreferrer">${trimmed}</a></p>`,
      );
    }

    setVideoUrl("");
    setShowVideoInput(false);
  };

  return (
    <div className="rte">
      <div className="rte-toolbar" role="toolbar" aria-label="Formato de texto">
        <button
          type="button"
          className="rte-toolbar__button rte-toolbar__button--format"
          onClick={() => runCommand("bold")}
        >
          <strong>N</strong>
        </button>
        <button
          type="button"
          className="rte-toolbar__button rte-toolbar__button--format"
          onClick={() => runCommand("italic")}
        >
          <em>K</em>
        </button>
        <button
          type="button"
          className="rte-toolbar__button rte-toolbar__button--format"
          onClick={() => runCommand("insertUnorderedList")}
        >
          Lista
        </button>
        <button
          type="button"
          className="rte-toolbar__button"
          onClick={handleImageButtonClick}
          disabled={uploadingImage}
        >
          {uploadingImage ? "Subiendo..." : "Insertar imagen"}
        </button>
        <button
          type="button"
          className="rte-toolbar__button"
          onClick={() => setShowVideoInput((current) => !current)}
        >
          Insertar video
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
      </div>

      {imageError && <p className="student-form__error" role="alert">{imageError}</p>}

      {showVideoInput && (
        <div className="rte-video-input">
          <input
            type="text"
            value={videoUrl}
            onChange={(event) => setVideoUrl(event.target.value)}
            placeholder="https://youtube.com/... o https://drive.google.com/..."
          />
          <button type="button" className="profile-page__button" onClick={handleInsertVideo}>
            Insertar
          </button>
          <button
            type="button"
            className="profile-sidebar__logout"
            onClick={() => {
              setShowVideoInput(false);
              setVideoUrl("");
              setVideoError("");
            }}
          >
            Cancelar
          </button>
        </div>
      )}
      {videoError && <p className="student-form__error" role="alert">{videoError}</p>}

      <div
        ref={editableRef}
        className="rte-editable"
        contentEditable
        suppressContentEditableWarning
        data-placeholder="Escribe la noticia aquí..."
      />
    </div>
  );
});

RichTextEditor.displayName = "RichTextEditor";

export default RichTextEditor;

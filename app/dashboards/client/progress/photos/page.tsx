"use client";

import { useEffect, useRef, useState } from "react";

import { MemberPortalShell } from "@/app/components/memberPortalShell";
import { resolveMediaUrl } from "@/lib/media";
import { progressPhotoService, type ProgressPhoto } from "@/services/progressPhotoService";

function photoUrl(path: string) {
  return resolveMediaUrl(path) ?? path;
}

export default function ProgressPhotosPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [label, setLabel] = useState<"before" | "progress" | "after">("progress");
  const [caption, setCaption] = useState("");
  const [weight, setWeight] = useState("");
  const [takenOn, setTakenOn] = useState(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const loadPhotos = async () => {
    try {
      const response = await progressPhotoService.getMine();
      setPhotos(response.photos);
    } catch (error) {
      setStatus({ type: "error", message: error instanceof Error ? error.message : "Unable to load progress photos." });
    }
  };

  useEffect(() => {
    void loadPhotos();
  }, []);

  const uploadPhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setSaving(true);
      const response = await progressPhotoService.upload({
        photo: file,
        label,
        caption,
        weight,
        taken_on: takenOn,
      });
      setStatus({ type: "success", message: response.message });
      setCaption("");
      setWeight("");
      await loadPhotos();
    } catch (error) {
      setStatus({ type: "error", message: error instanceof Error ? error.message : "Unable to upload progress photo." });
    } finally {
      setSaving(false);
      event.target.value = "";
    }
  };

  return (
    <MemberPortalShell activePage="progressPhotos" title="PROGRESS PHOTOS" subtitle="Upload before, progress, and after photos backed by the progress photo API.">
      <div className="hh-card" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {status ? <p className={status.type === "error" ? "hh-error-msg" : "hh-text-green"} style={{ gridColumn: "1 / -1" }}>{status.message}</p> : null}
        <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={uploadPhoto} style={{ display: "none" }} />
        <div className="hh-field">
          <label className="hh-field__label">Label</label>
          <select className="hh-input" value={label} onChange={(event) => setLabel(event.target.value as typeof label)} style={{ appearance: "auto" }}>
            <option value="before">Before</option>
            <option value="progress">Progress</option>
            <option value="after">After</option>
          </select>
        </div>
        <div className="hh-field">
          <label className="hh-field__label">Taken On</label>
          <input className="hh-input" type="date" value={takenOn} onChange={(event) => setTakenOn(event.target.value)} />
        </div>
        <div className="hh-field">
          <label className="hh-field__label">Weight</label>
          <input className="hh-input" value={weight} onChange={(event) => setWeight(event.target.value)} placeholder="Optional" />
        </div>
        <div className="hh-field">
          <label className="hh-field__label">Caption</label>
          <input className="hh-input" value={caption} onChange={(event) => setCaption(event.target.value)} placeholder="Optional" />
        </div>
        <button className="btn btn--primary" onClick={() => inputRef.current?.click()} disabled={saving} style={{ gridColumn: "1 / -1" }}>
          {saving ? "Uploading..." : "Upload Progress Photo"}
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
        {photos.map((photo) => (
          <figure key={photo.photo_id} className="hh-card" style={{ margin: 0, padding: 10 }}>
            <img src={photoUrl(photo.file_path)} alt={photo.caption ?? photo.label} style={{ width: "100%", aspectRatio: "3 / 4", objectFit: "cover", borderRadius: 12 }} />
            <figcaption style={{ marginTop: 8, color: "var(--hh-text-muted)", fontSize: 12 }}>
              {photo.label} · {photo.taken_on ?? "No date"}
            </figcaption>
          </figure>
        ))}
        {photos.length === 0 ? <p className="hh-text-muted">No progress photos uploaded yet.</p> : null}
      </div>
    </MemberPortalShell>
  );
}

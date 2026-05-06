"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

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
  const [selected, setSelected] = useState<ProgressPhoto | null>(null);

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

  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setSelected(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

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
      {/* Upload form */}
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
          <input
            className="hh-input"
            value={weight}
            maxLength={5}
            onChange={(event) => {
              const v = event.target.value;
              if (v === "" || /^\d{0,3}(\.\d*)?$/.test(v)) setWeight(v);
            }}
            placeholder="Optional"
          />
        </div>
        <div className="hh-field">
          <label className="hh-field__label">Caption</label>
          <input className="hh-input" value={caption} onChange={(event) => setCaption(event.target.value)} placeholder="Optional" />
        </div>
        <button className="btn btn--primary" onClick={() => inputRef.current?.click()} disabled={saving} style={{ gridColumn: "1 / -1" }}>
          {saving ? "Uploading..." : "Upload Progress Photo"}
        </button>
      </div>

      {/* Photo grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
        {photos.map((photo) => (
          <figure
            key={photo.photo_id}
            className="hh-card"
            style={{ margin: 0, padding: 10, cursor: "pointer" }}
            onClick={() => setSelected(photo)}
          >
            <img
              src={photoUrl(photo.file_path)}
              alt={photo.caption ?? photo.label}
              style={{ width: "100%", aspectRatio: "3 / 4", objectFit: "cover", borderRadius: 12 }}
            />
            <figcaption style={{ marginTop: 8, color: "var(--hh-text-muted)", fontSize: 12 }}>
              {photo.label} · {photo.taken_on ?? "No date"}
              {photo.weight_at_time != null ? ` · ${photo.weight_at_time} lbs` : ""}
            </figcaption>
          </figure>
        ))}
        {photos.length === 0 ? <p className="hh-text-muted">No progress photos uploaded yet.</p> : null}
      </div>

      {/* Lightbox modal */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(0,0,0,0.85)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--hh-bg-card)",
              borderRadius: 16,
              overflow: "hidden",
              maxWidth: 520,
              width: "100%",
              boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
            }}
          >
            <img
              src={photoUrl(selected.file_path)}
              alt={selected.caption ?? selected.label}
              style={{ width: "100%", maxHeight: "60vh", objectFit: "contain", display: "block", background: "#000" }}
            />
            <div style={{ padding: "16px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <span style={{
                    display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
                    textTransform: "uppercase", color: "var(--hh-accent-light)",
                    background: "var(--hh-accent-15)", borderRadius: 6, padding: "3px 8px", marginBottom: 6,
                  }}>
                    {selected.label}
                  </span>
                  <div style={{ color: "var(--hh-text-muted)", fontSize: 13 }}>
                    {selected.taken_on ?? "No date"}
                  </div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="btn btn--ghost"
                  style={{ padding: 4, color: "var(--hh-text-muted)" }}
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              {selected.weight_at_time != null && (
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 10 }}>
                  <span style={{ fontSize: 11, color: "var(--hh-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Weight</span>
                  <span style={{ fontSize: 18, fontWeight: 700, color: "var(--hh-text-primary)", fontFamily: "var(--hh-font-display)" }}>
                    {selected.weight_at_time} lbs
                  </span>
                </div>
              )}

              {selected.caption && (
                <p style={{ fontSize: 14, color: "var(--hh-text-primary)", lineHeight: 1.5, margin: 0 }}>
                  {selected.caption}
                </p>
              )}

              {!selected.caption && selected.weight_at_time == null && (
                <p style={{ fontSize: 13, color: "var(--hh-text-muted)", margin: 0 }}>No additional details.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </MemberPortalShell>
  );
}

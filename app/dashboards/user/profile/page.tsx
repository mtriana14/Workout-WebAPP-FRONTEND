"use client";

import { useState, useRef } from "react";

export default function ProfilePage() {
  const [currentPhoto, setCurrentPhoto] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 1 and 2: User clicks "Upload Photo", system opens picker
  const handleUploadClick = () => {
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Step 3: User selects a photo (or triggers Alternative Flows)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    // Alternative Flow 1: User cancels without selecting an image
    if (!file) return; 

    // Alternative Flow 2: User selects an unspecified file format
    const validTypes = ["image/jpeg", "image/png"];
    if (!validTypes.includes(file.type)) {
      setError("Please select a valid image file format (JPG, PNG)");
      e.target.value = ""; 
      return;
    }

    // Step 4: System previews the image and asks the user to confirm
    setError("");
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // Step 5, 6 and 7: User confirms, system uploads and displays updated photo
  const handleConfirm = () => {
    if (!selectedFile || !previewUrl) return;
    
    setIsUploading(true);

    // Mocking the backend upload delay
    setTimeout(() => {
      setCurrentPhoto(previewUrl);
      setPreviewUrl(null);
      setSelectedFile(null);
      setIsUploading(false);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }, 1000);
  };

  const handleCancelPreview = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="hh-dash-root">
      <main className="hh-dash-main" style={{ display: "flex", justifyContent: "center", paddingTop: "64px" }}>
        <div className="hh-dash-content" style={{ alignItems: "center", textAlign: "center", width: "100%", maxWidth: "600px" }}>
          
          <div>
            <h1 className="hh-page-title">Profile Settings</h1>
            <p className="hh-page-subtitle">Manage your account details and profile photo.</p>
          </div>

          {/* Profile Photo Card */}
          <div className="hh-card" style={{ width: "100%", maxWidth: "400px", display: "flex", flexDirection: "column", alignItems: "center", gap: "24px" }}>
            
            <div className="hh-card__header" style={{ width: "100%", justifyContent: "center", marginBottom: "0" }}>
              <span className="hh-card__label">Profile Photo</span>
            </div>
              
            {/* Photo Display/Placeholder */}
            <div 
              style={{ 
                width: "120px", 
                height: "120px", 
                borderRadius: "50%", 
                overflow: "hidden", 
                border: "2px solid var(--hh-border)",
                backgroundColor: "var(--hh-bg-card-dark)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              {previewUrl || currentPhoto ? (
                <img 
                  src={previewUrl || currentPhoto || ""} 
                  alt="User Profile" 
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                />
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--hh-text-muted)" strokeWidth="1.5" style={{ width: "50px", height: "50px" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              )}
            </div>

            {/* Error Message Display */}
            {error && <p className="hh-error-msg" style={{ marginTop: "0" }}>{error}</p>}

            <input 
              type="file" 
              accept="image/jpeg, image/png" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
              style={{ display: "none" }} 
            />

            {!previewUrl ? (
              <button type="button" className="btn btn--primary" onClick={handleUploadClick}>
                Upload Photo
              </button>
            ) : (
              <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                <button 
                  type="button" 
                  className="btn btn--primary" 
                  onClick={handleConfirm}
                  disabled={isUploading}
                >
                  {isUploading ? "Saving..." : "Confirm"}
                </button>
                <button 
                  type="button" 
                  className="btn btn--ghost" 
                  onClick={handleCancelPreview}
                  disabled={isUploading}
                >
                  Cancel
                </button>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
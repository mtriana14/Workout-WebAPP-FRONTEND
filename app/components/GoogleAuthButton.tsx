"use client";

import { useEffect, useRef, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import type { CredentialResponse } from "@react-oauth/google";

interface GoogleAuthButtonProps {
  onSuccess: (credentialResponse: CredentialResponse) => void;
  onError: () => void;
  text?: "signin_with" | "signup_with" | "continue_with";
}

export function GoogleAuthButton({
  onSuccess,
  onError,
  text = "continue_with",
}: GoogleAuthButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [buttonWidth, setButtonWidth] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const syncWidth = () => {
      setButtonWidth(Math.max(240, Math.floor(container.getBoundingClientRect().width)));
    };

    syncWidth();

    const observer = new ResizeObserver(syncWidth);
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="hh-google-auth">
      {buttonWidth ? (
        <GoogleLogin
          onSuccess={onSuccess}
          onError={onError}
          theme="filled_black"
          shape="rectangular"
          size="large"
          text={text}
          width={String(buttonWidth)}
          logo_alignment="left"
        />
      ) : null}
    </div>
  );
}

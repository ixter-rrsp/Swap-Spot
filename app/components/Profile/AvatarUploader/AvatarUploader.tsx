"use client";

import {
  useRef,
  useState,
} from "react";

import Image from "next/image";
import { useRouter } from "next/navigation";

import type { Profile } from "@/lib/types/Profile";

import styles from "./AvatarUploader.module.css";
import ImageCropper from "./ImageCropper";
import { useToast } from "@/app/components/UI/Toast/ToastContext";

interface AvatarUploaderProps {
  profile: Profile;
}


export default function AvatarUploader({
  profile,
}: AvatarUploaderProps) {

  const router = useRouter();

  const inputRef =
    useRef<HTMLInputElement>(null);

  const toast = useToast();


  const [selectedFile, setSelectedFile] =
    useState<File | Blob | null>(null);

  const [preview, setPreview] =
    useState<string | null>(null);
    
  const [cropImageSrc, setCropImageSrc] = 
    useState<string | null>(null);

  const [error, setError] =
    useState("");

  // toast will be provided via Providers
  // remove inline success UI in favor of global toast
  // keep error state for inline error messages

  const [loading, setLoading] =
    useState(false);


  const initial =
    profile.fullName
      .charAt(0)
      .toUpperCase();


  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {

    const file =
      event.target.files?.[0];


    if (!file) {
      return;
    }


    setError("");


    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];


    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      setError(
        "Only JPG, PNG, and WEBP images are allowed."
      );

      return;
    }


    if (
      file.size >
      5 * 1024 * 1024
    ) {
      setError(
        "Image size must be under 5MB."
      );

      return;
    }

    const previewUrl =
      URL.createObjectURL(file);

    setCropImageSrc(previewUrl);
    
    // Reset file input so the same file can be selected again
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function handleCropComplete(croppedBlob: Blob) {
    setSelectedFile(croppedBlob);
    setPreview(URL.createObjectURL(croppedBlob));
    setCropImageSrc(null);
  }
  
  function handleCropCancel() {
    setCropImageSrc(null);
  }

  async function handleUpload() {

    if (!selectedFile) {
      return;
    }


    setLoading(true);
    setError("");


    const formData =
      new FormData();


    formData.append(
      "file",
      selectedFile
    );


    const response =
      await fetch(
        "/api/profile/avatar",
        {
          method: "PATCH",
          body: formData,
        }
      );


    const result = await response.json();

    if (!response.ok) {
      setError(result.error ?? "Failed to upload avatar.");
      setLoading(false);
      return;
    }

    // Use returned avatar URL for optimistic preview and keep it visible
    if (result.avatarUrl) {
      setPreview(result.avatarUrl);
      // dispatch global event so other client components can update immediately
      try {
        window.dispatchEvent(new CustomEvent("swapspot:avatar-updated", { detail: { avatarUrl: result.avatarUrl } }));
      } catch {}

      toast("Avatar updated", "success", {
        label: "Undo",
        onClick: () => {
          toast("Avatar undo is not available yet.", "error");
        },
      });
    }

    setSelectedFile(null);
    setError("");

    // Ensure cropper closed
    setCropImageSrc(null);

    // Refresh server data in background
    router.refresh();

    setLoading(false);
  }


  return (
    <>
      <section
        className={styles.container}
      >

        <div
          className={styles.avatar}
        >

          {preview ||
          profile.avatarUrl ? (

            <Image
              src={
                preview ??
                profile.avatarUrl!
              }
              alt={
                profile.fullName
              }
              fill
              className={
                styles.image
              }
            />

          ) : (

            <span>
              {initial}
            </span>

          )}

        </div>


        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={
            handleFileChange
          }
        />


        <button
          type="button"
          className={styles.button}
          onClick={() =>
            inputRef.current?.click()
          }
          disabled={loading}
        >
          Change Photo
        </button>


        {selectedFile && (

          <button
            type="button"
            className={styles.button}
            onClick={handleUpload}
            disabled={loading}
          >
            {loading
              ? "Uploading..."
              : "Save Photo"}
          </button>

        )}


        {error && (
          <p className={styles.error}>{error}</p>
        )}

      </section>
      
      {cropImageSrc && (
        <ImageCropper
          imageSrc={cropImageSrc}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </>
  );
}
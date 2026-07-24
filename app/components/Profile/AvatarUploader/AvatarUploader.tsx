"use client";

import {
  useRef,
  useState,
} from "react";

import Image from "next/image";
import { useRouter } from "next/navigation";

import type { Profile } from "@/lib/types/Profile";

import styles from "./AvatarUploader.module.css";


interface AvatarUploaderProps {
  profile: Profile;
}


export default function AvatarUploader({
  profile,
}: AvatarUploaderProps) {

  const router = useRouter();

  const inputRef =
    useRef<HTMLInputElement>(null);


  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [preview, setPreview] =
    useState<string | null>(null);

  const [error, setError] =
    useState("");

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


    setSelectedFile(file);


    const previewUrl =
      URL.createObjectURL(file);


    setPreview(previewUrl);
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


    const result =
      await response.json();


    if (!response.ok) {

      setError(
        result.error ??
        "Failed to upload avatar."
      );

      setLoading(false);

      return;
    }


    router.refresh();

    setSelectedFile(null);
    setPreview(null);

    setLoading(false);
  }


  return (
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
        <p className={styles.error}>
          {error}
        </p>
      )}

    </section>
  );
}
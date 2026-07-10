"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createListing } from "@/lib/services/ListingService";

import {
  listingSchema,
  ListingFormData,
} from "@/lib/validations/ListingSchema";

import ImageUploader from "../ImageUploader/ImageUploader";

import styles from "./PostListingForm.module.css";

export default function PostListingForm() {
  const [images, setImages] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
  });

  async function onSubmit(data: ListingFormData) {
    try {
      const listing = await createListing(data, images);

      console.log("Listing created:", listing);

      alert("Listing posted successfully!");
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    }
  }

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit(onSubmit)}
    >
      <ImageUploader
        images={images}
        onImagesChange={setImages}
      />

      <div className={styles.field}>
        <label htmlFor="title">Title</label>

        <input
          id="title"
          type="text"
          placeholder="Gaming Laptop"
          {...register("title")}
        />

        <p>{errors.title?.message}</p>
      </div>

      <div className={styles.field}>
        <label htmlFor="description">Description</label>

        <textarea
          id="description"
          rows={5}
          placeholder="Describe your item..."
          {...register("description")}
        />

        <p>{errors.description?.message}</p>
      </div>

      <div className={styles.field}>
        <label htmlFor="city">City</label>

        <input
          id="city"
          type="text"
          placeholder="Caloocan City"
          {...register("city")}
        />

        <p>{errors.city?.message}</p>
      </div>

      <div className={styles.field}>
        <label htmlFor="lookingFor">Looking For</label>

        <input
          id="lookingFor"
          type="text"
          placeholder="Gaming PC"
          {...register("lookingFor")}
        />

        <p>{errors.lookingFor?.message}</p>
      </div>

      <div className={styles.field}>
        <label htmlFor="swapValue">
          Estimated Swap Value
        </label>

        <input
          id="swapValue"
          type="number"
          placeholder="45000"
          {...register("swapValue", {
            valueAsNumber: true,
          })}
        />

        <p>{errors.swapValue?.message}</p>
      </div>

      <button
        className={styles.submitButton}
        type="submit"
      >
        Post Listing
      </button>
    </form>
  );
}
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/components/UI/Toast/ToastContext";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Spinner from "@/app/components/UI/Spinner/Spinner";

import { uploadListingImages } from "@/lib/services/StorageService";

import ImageUploader from "../ImageUploader/ImageUploader";

import type { ListingImage } from "@/lib/types/ListingImage";

import {
  createListing,
  updateListing,
} from "@/lib/services/ListingService";

import {
  listingSchema,
  ListingFormData,
  ListingFormInput,
} from "@/lib/validations/ListingSchema";

import type { Listing } from "@/lib/types/Listing";

import styles from "./PostListingForm.module.css";

interface PostListingFormProps {
  listing?: Listing;
}

export default function PostListingForm({
  listing,
}: PostListingFormProps) {
  const router = useRouter();

  const isEditMode = !!listing;

  const [images, setImages] = useState<ListingImage[]>(() => {
    if (!listing?.images) return [];

    return listing.images.map((image) => ({
      id: image.id,
      preview: image.url,
      existing: true,
    }));
  });

  const [loading, setLoading] = useState(false);
  const toast = useToast();


  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ListingFormInput, unknown, ListingFormData>({
    resolver: zodResolver(listingSchema),

    defaultValues: {
      title: listing?.title ?? "",
      description: listing?.description ?? "",
      lookingFor: listing?.lookingFor ?? "",
      swapValue: listing?.swapValue ?? 0,
      showOnMap: listing?.showOnMap ?? true,
    },
  });



  async function onSubmit(data: ListingFormData) {
    if (loading) return;

    setLoading(true);

    try {

      if (isEditMode && listing) {

        const existingImages = images
          .filter((image) => image.existing)
          .map((image) => image.preview);


        const newFiles = images
          .filter(
            (image) =>
              !image.existing &&
              image.file
          )
          .map(
            (image) => image.file!
          );


        console.log("[PostListingForm] uploading new images", newFiles.length);
        const uploadedImages =
          await uploadListingImages(newFiles);
        console.log("[PostListingForm] upload complete", uploadedImages);


        const imageUrls = [
          ...existingImages,
          ...uploadedImages,
        ];


        const payload = {
          ...data,
          city: listing.city ?? "",
        };

        console.log("[PostListingForm] submitting update", { listingId: listing.id, payload, imageUrls });
        await updateListing(
          listing.id,
          payload,
          imageUrls
        );


        toast(
          "Listing updated successfully!",
          "success"
        );


        router.push(
          `/Listing/${listing.id}`
        );


      } else {

        const files = images
          .filter(
            (image) =>
              !image.existing &&
              image.file
          )
          .map(
            (image) => image.file!
          );


        const newListing =
          await createListing(
            data,
            files
          );


        console.log(
          "Listing created:",
          newListing
        );


        toast(
          "Listing posted successfully!",
          "success"
        );


        router.replace("/home");
      }


      router.refresh();


    } catch (error) {
      console.error(error);
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong.";

      if (
        message.toLowerCase().includes("logged in") ||
        message.toLowerCase().includes("unauthenticated") ||
        message.toLowerCase().includes("unauthorized")
      ) {
        router.push("/login");
        return;
      }

      toast(message, "error");
    } finally {

      setLoading(false);

    }
  }



  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit(onSubmit)}
    >

      <div className={styles.ticketHeader}>
        <small>SwapSpot Barter Ticket</small>

        <h2 className={styles.ticketTitle}>
          {isEditMode ? "Edit Trade Ticket" : "New Trade Ticket"}
        </h2>
      </div>



      <div className={styles.content}>

        <h3 className={styles.sectionTitle}>
          You're Offering
        </h3>


        <ImageUploader
          images={images}
          onImagesChange={setImages}
          disabled={loading}
        />



        <div className={styles.field}>
          <label htmlFor="title">
            Item Title
          </label>

          <input
            id="title"
            type="text"
            placeholder="Gaming Laptop"
            disabled={loading}
            {...register("title")}
          />

          <p>
            {errors.title?.message}
          </p>
        </div>




        <div className={styles.field}>
          <label htmlFor="description">
            Description
          </label>

          <textarea
            id="description"
            rows={4}
            placeholder="What's the condition? Why are you swapping it?"
            disabled={loading}
            {...register("description")}
          />

          <p>
            {errors.description?.message}
          </p>
        </div>




        <h3 className={styles.sectionTitle}>
          You're Looking For
        </h3>



        <div className={styles.field}>
          <label htmlFor="lookingFor">
            Looking For
          </label>

          <input
            id="lookingFor"
            type="text"
            placeholder="Gaming PC"
            disabled={loading}
            {...register("lookingFor")}
          />

          <p>
            {errors.lookingFor?.message}
          </p>
        </div>



        <div className={styles.field}>
          <label>
            Listing Location
          </label>

          <div className={styles.locationBox}>
            📍 Uses your profile location
          </div>
        </div>




        <div className={styles.field}>
          <label htmlFor="swapValue">
            Estimated Swap Value
          </label>

          <input
            id="swapValue"
            type="number"
            placeholder="45000"
            disabled={loading}
            {...register("swapValue", {
              valueAsNumber: true,
            })}
          />

          <p>
            {errors.swapValue?.message}
          </p>
        </div>




        <div className={styles.toggleContainer}>
          <div className={styles.toggleLabel}>
            <label className={styles.label}>
              Show this listing on the public map
            </label>
            <p className={styles.helper}>
              When enabled, your listing can appear on the Discover map using its approximate location. This helps nearby users find your listing while protecting your privacy.
            </p>
          </div>
          <label
            className={`${styles.toggle} ${
              watch("showOnMap") ? styles.enabled : styles.disabled
            }`}
          >
            <input
              type="checkbox"
              disabled={loading}
              {...register("showOnMap")}
            />
            <div className={styles.toggleCircle} />
          </label>
        </div>




        <button
          className={styles.submitButton}
          type="submit"
          disabled={loading}
        >

          {loading ? (
            <>
              <Spinner size={18} />

              <span>
                {isEditMode
                  ? "Saving..."
                  : "Posting..."}
              </span>
            </>
          ) : isEditMode ? (
            "SAVE CHANGES"
          ) : (
            "POST THIS TRADE"
          )}

        </button>

      </div>

    </form>
  );
}
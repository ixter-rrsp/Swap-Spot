"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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


  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),

    defaultValues: {
      title: listing?.title ?? "",
      description: listing?.description ?? "",
      lookingFor: listing?.lookingFor ?? "",
      swapValue: listing?.swapValue ?? 0,
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


        const uploadedImages =
          await uploadListingImages(newFiles);


        const imageUrls = [
          ...existingImages,
          ...uploadedImages,
        ];


        await updateListing(
          listing.id,
          data,
          imageUrls
        );


        alert(
          "Listing updated successfully!"
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


        alert(
          "Listing posted successfully!"
        );


        router.replace("/home");
      }


      router.refresh();


    } catch (error) {

      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );

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
        <small>
          SwapSpot Barter Ticket
        </small>

        <h1>
          {isEditMode
            ? "Edit Trade Ticket"
            : "New Trade Ticket"}
        </h1>
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
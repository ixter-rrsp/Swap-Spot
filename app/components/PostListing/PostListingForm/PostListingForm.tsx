"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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

import { BOOST_OPTIONS, BoostDuration, BoostOption } from "@/lib/pricing/boost";

import styles from "./PostListingForm.module.css";

const DRAFT_STORAGE_KEY = "swapspot_pending_listing_draft";

interface PostListingFormProps {
  listing?: Listing;
}

export default function PostListingForm({
  listing,
}: PostListingFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

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
  const [limitReached, setLimitReached] = useState<string | null>(null);
  const [payingOverage, setPayingOverage] = useState(false);
  const toast = useToast();

  const initialDraft = (() => {
    if (isEditMode || typeof window === "undefined") return null;
    if (searchParams.get("overage_status") !== "success") return null;
    try {
      const raw = sessionStorage.getItem(DRAFT_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const [wantBoost, setWantBoost] = useState(initialDraft?.wantBoost ?? false);
  const [boostDuration, setBoostDuration] = useState<BoostDuration>(
    initialDraft?.boostDuration ?? 3
  );

  const hasHandledResume = useRef(false);
  const pendingOveragePaymentId = useRef<string | null>(null);

  // Resume listing creation after returning from the ₱5 overage checkout.
  // Images can't survive the redirect (File objects aren't serializable),
  // so we restore the text fields and ask the user to re-add photos.
  useEffect(() => {
    if (isEditMode || hasHandledResume.current) return;
    if (searchParams.get("overage_status") !== "success") return;

    hasHandledResume.current = true;

    const sessionId = searchParams.get("session_id");
    const draftRaw = sessionStorage.getItem(DRAFT_STORAGE_KEY);

    if (!sessionId || !draftRaw) return;

    (async () => {
      try {
        const verifyResponse = await fetch(
          `/api/payments/verify?session_id=${encodeURIComponent(sessionId)}`
        );
        const verifyResult = await verifyResponse.json();

        if (!verifyResponse.ok || verifyResult.status !== "paid") {
          toast(
            "We couldn't confirm your payment yet. Please try posting again.",
            "error"
          );
          return;
        }

        sessionStorage.removeItem(DRAFT_STORAGE_KEY);
        toast(
          "Payment confirmed! Please re-add your photos, then submit to finish posting.",
          "success"
        );

        // Text fields are restored via defaultValues below on next render;
        // store the payment id so onSubmit can pass it through.
        pendingOveragePaymentId.current = verifyResult.id;
      } catch (err) {
        console.error("Failed to verify overage payment:", err);
      }
    })();
  }, [isEditMode, searchParams, toast]);


  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ListingFormInput, unknown, ListingFormData>({
    resolver: zodResolver(listingSchema),

    defaultValues: {
      title: initialDraft?.title ?? listing?.title ?? "",
      description: initialDraft?.description ?? listing?.description ?? "",
      lookingFor: initialDraft?.lookingFor ?? listing?.lookingFor ?? "",
      swapValue: initialDraft?.swapValue ?? listing?.swapValue ?? 0,
      showOnMap: initialDraft?.showOnMap ?? listing?.showOnMap ?? true,
    },
  });



  async function onSubmit(data: ListingFormData) {
    if (loading) return;
    setLimitReached(null);
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
            files,
            pendingOveragePaymentId.current || undefined
          );

        pendingOveragePaymentId.current = null;


        console.log(
          "Listing created:",
          newListing
        );

        // If the user opted to boost this listing, kick off the boost
        // checkout right after creation instead of going to /home.
        if (wantBoost) {
          try {
            const boostResponse = await fetch(
              `/api/listings/${newListing.id}/boost`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ durationDays: boostDuration }),
              }
            );
            const boostResult = await boostResponse.json();

            if (boostResponse.ok && boostResult.checkoutUrl) {
              toast("Listing posted! Redirecting you to pay for your boost...", "success");
              window.location.href = boostResult.checkoutUrl;
              return;
            }

            toast(
              "Listing posted, but we couldn't start the boost checkout. You can boost it later from your profile.",
              "error"
            );
          } catch (boostErr) {
            console.error("Failed to start boost checkout:", boostErr);
            toast(
              "Listing posted, but we couldn't start the boost checkout. You can boost it later from your profile.",
              "error"
            );
          }
        } else {
          toast(
            "Listing posted successfully!",
            "success"
          );
        }


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

      // Listing limit reached — show upgrade banner instead of toast
      if (message.toLowerCase().includes("listing limit")) {
        setLimitReached(message);
        return;
      }

      toast(message, "error");
    } finally {

      setLoading(false);

    }
  }



  async function handlePayOverage() {
    if (payingOverage) return;
    setPayingOverage(true);

    try {
      // Persist the current text-field values so we can restore them after
      // the redirect to PayMongo and back. Images can't be persisted here.
      const currentValues = {
        title: watch("title"),
        description: watch("description"),
        lookingFor: watch("lookingFor"),
        swapValue: watch("swapValue"),
        showOnMap: watch("showOnMap"),
        wantBoost,
        boostDuration,
      };
      sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(currentValues));

      const response = await fetch("/api/listings/overage", {
        method: "POST",
      });
      const result = await response.json();

      if (!response.ok || !result.checkoutUrl) {
        toast(result.error || "Failed to start payment.", "error");
        return;
      }

      window.location.href = result.checkoutUrl;
    } catch (err) {
      console.error("Failed to start overage checkout:", err);
      toast("Failed to start payment. Please try again.", "error");
    } finally {
      setPayingOverage(false);
    }
  }

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit(onSubmit)}
    >

      {limitReached && (
        <div className={styles.limitBanner}>
          <div className={styles.limitBannerIcon}>🚀</div>
          <div className={styles.limitBannerContent}>
            <strong>Listing Limit Reached</strong>
            <p>{limitReached}</p>
            <div className={styles.limitBannerActions}>
              <Link href="/subscriptions" className={styles.limitBannerCta}>
                View Subscription Plans →
              </Link>
              <button
                type="button"
                className={styles.limitBannerPayButton}
                onClick={handlePayOverage}
                disabled={payingOverage}
              >
                {payingOverage ? "Redirecting..." : "Pay ₱5 to post this one anyway"}
              </button>
            </div>
          </div>
        </div>
      )}

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




        {!isEditMode && (
          <div className={styles.toggleContainer}>
            <div className={styles.toggleLabel}>
              <label className={styles.label}>
                Boost this listing
              </label>
              <p className={styles.helper}>
                Boosted listings appear in the Boosted section for extra visibility.
              </p>
            </div>
            <label
              className={`${styles.toggle} ${
                wantBoost ? styles.enabled : styles.disabled
              }`}
            >
              <input
                type="checkbox"
                disabled={loading}
                checked={wantBoost}
                onChange={(e) => setWantBoost(e.target.checked)}
              />
              <div className={styles.toggleCircle} />
            </label>
          </div>
        )}

        {!isEditMode && wantBoost && (
          <div className={styles.boostOptions}>
            {(Object.values(BOOST_OPTIONS) as BoostOption[]).map(
              (option) => (
                <label
                  key={option.durationDays}
                  className={`${styles.boostOption} ${
                    boostDuration === option.durationDays ? styles.boostOptionSelected : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="boostDuration"
                    disabled={loading}
                    checked={boostDuration === option.durationDays}
                    onChange={() => setBoostDuration(option.durationDays)}
                  />
                  <span>{option.label}</span>
                  <strong>₱{option.price}</strong>
                </label>
              )
            )}
          </div>
        )}

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
import { createClient } from "@/utils/supabase/client";
import { SubscriptionService } from "./SubscriptionService";
import type { ListingFormData } from "../validations/ListingSchema";

import {
  uploadListingImages,
  deleteListingImages,
} from "./StorageService";
import { getFallbackCityCoordinates, resolveListingLandmark } from "./landmark";

export async function createListing(
  data: ListingFormData,
  images: File[],
  overagePaymentId?: string
) {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(
      "You must be logged in to post a listing."
    );
  }

  // Check subscription listing entitlement before creating listing
  try {
    const currentSub = await SubscriptionService.getCurrentSubscription();
    if (
      currentSub &&
      currentSub.plan.maxActiveListings !== null &&
      currentSub.plan.maxActiveListings > 0
    ) {
      const { count } = await supabase
        .from("listings")
        .select("id", { count: "exact", head: true })
        .eq("owner_id", user.id)
        .eq("traded", false);

      if ((count || 0) >= currentSub.plan.maxActiveListings) {
        // Free-plan (or any capped-plan) user can bypass the limit for this
        // one post by paying the overage fee first (see /post's "Pay ₱5 to
        // post anyway" flow). The payment must be verified + consumed here.
        if (overagePaymentId) {
          const consumeResponse = await fetch(
            "/api/listings/overage/consume",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ paymentId: overagePaymentId }),
            }
          );

          if (!consumeResponse.ok) {
            const consumeResult = await consumeResponse.json().catch(() => ({}));
            throw new Error(
              consumeResult.error ||
                "Your extra-post payment could not be verified. Please try again."
            );
          }
        } else {
          throw new Error(
            `Listing limit reached. Your current plan (${currentSub.plan.name}) is limited to ${currentSub.plan.maxActiveListings} active listings. Please upgrade your subscription to post more items.`
          );
        }
      }
    }
  } catch (err: any) {
    if (
      err.message &&
      (err.message.includes("Listing limit reached") ||
        err.message.includes("overage") ||
        err.message.includes("extra-post payment"))
    ) {
      throw err;
    }
    console.warn("Entitlement check warning:", err);
  }

  // Get owner's saved location
  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select(`
      city,
      latitude,
      longitude,
      suspension_status
    `)
    .eq("id", user.id)
    .single();

  if (profileError) {
    throw new Error(
      "Failed to get profile location."
    );
  }

  // Real enforcement lives in a DB trigger (block_suspended_listing_insert)
  // so it can't be bypassed — this is just a friendlier, earlier error so we
  // don't burn an image upload before finding out.
  if (profile.suspension_status && profile.suspension_status !== "none") {
    throw new Error(
      "Your account is currently suspended and can't post new listings."
    );
  }

  if (
    profile.latitude == null ||
    profile.longitude == null
  ) {
    throw new Error(
      "Please set your location before posting a listing."
    );
  }

  const landmarkInfo = await resolveListingLandmark(
    profile.latitude,
    profile.longitude,
    profile.city
  );
  const fallbackCity = landmarkInfo.city || profile.city || "";
  const fallbackCoordinates = getFallbackCityCoordinates(fallbackCity);
  const resolvedLandmark = landmarkInfo.landmark || fallbackCity || null;
  const resolvedLatitude = landmarkInfo.landmarkLatitude ?? fallbackCoordinates?.lat ?? null;
  const resolvedLongitude = landmarkInfo.landmarkLongitude ?? fallbackCoordinates?.lon ?? null;
  console.log("[createListing] landmark info", {
    landmarkInfo,
    fallbackCity,
    resolvedLandmark,
    resolvedLatitude,
    resolvedLongitude,
  });

  let imageUrls: string[] = [];
  let createdListingId: string | null = null;

  try {
    // Upload images
    imageUrls = await uploadListingImages(
      images
    );

    // Create listing
    const {
      data: listing,
      error: listingError,
    } = await supabase
      .from("listings")
      .insert({
        owner_id: user.id,

        title: data.title,
        description: data.description,

        city: fallbackCity || profile.city,
        latitude: profile.latitude,
        longitude: profile.longitude,
        nearby_landmark: resolvedLandmark,
        landmark_latitude: resolvedLatitude,
        landmark_longitude: resolvedLongitude,

        looking_for: data.lookingFor,
        swap_value: data.swapValue,

        category: data.category,
        condition: data.condition,

        show_on_map: data.showOnMap ?? true,

        boosted: false,
      })
      .select()
      .single();

    console.log("[createListing] insert result", { listing, listingError });

    if (listingError) {
      throw new Error(
        listingError.message
      );
    }

    createdListingId = listing.id;

    // Save image rows
    if (imageUrls.length > 0) {
      const imageRows = imageUrls.map(
        (url, index) => ({
          listing_id: listing.id,
          image_url: url,
          sort_order: index,
        })
      );

      const {
        error: imageError,
      } = await supabase
        .from("listing_images")
        .insert(imageRows);

      if (imageError) {
        throw new Error(
          imageError.message
        );
      }
    }

    return listing;
  } catch (error) {
    // Delete created listing if it exists
    if (createdListingId) {
      try {
        await supabase
          .from("listings")
          .delete()
          .eq("id", createdListingId);
      } catch (cleanupError) {
        console.error(
          "Failed to clean up listing:",
          cleanupError
        );
      }
    }

    // Delete uploaded images
    if (imageUrls.length > 0) {
      try {
        await deleteListingImages(
          imageUrls
        );
      } catch (cleanupError) {
        console.error(
          "Failed to clean up uploaded images:",
          cleanupError
        );
      }
    }

    throw error;
  }
}

export async function updateListing(
  id: string,
  data: ListingFormData & { city?: string },
  images: string[]
) {
  const payload = {
    ...data,
    city: data.city ?? "",
    showOnMap: data.showOnMap ?? true,
    images,
  };

  console.log("[updateListing client] sending", { id, payload });

  const response = await fetch(
    `/api/listings/${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  const text = await response.text();
  let result: unknown = null;

  try {
    result = text ? JSON.parse(text) : null;
  } catch {
    result = { raw: text };
  }

  console.log("[updateListing client] response", {
    status: response.status,
    body: text,
  });

  if (!response.ok) {
    const errorMessage =
      typeof result === "object" && result && "error" in result && typeof (result as { error?: unknown }).error === "string"
        ? (result as { error: string }).error
        : "Failed to update listing.";

    throw new Error(errorMessage);
  }

  return result;
}
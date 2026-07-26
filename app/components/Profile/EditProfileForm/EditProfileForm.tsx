"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  BadgeInfo,
  MapPin,
  User,
  LocateFixed,
} from "lucide-react";

import type { Profile } from "@/lib/types/Profile";

import {
  UpdateProfileFormData,
  UpdateProfileSchema,
} from "@/lib/validations/UpdateProfileSchema";

import AvatarUploader from "../AvatarUploader/AvatarUploader";

import TextField from "@/app/components/UI/TextField/TextField";
import TextArea from "@/app/components/UI/TextArea/TextArea";

import LocationCard from "../LocationCard/LocationCard";

import styles from "./EditProfileForm.module.css";

interface EditProfileFormProps {
  profile: Profile;
}

export default function EditProfileForm({
  profile,
}: EditProfileFormProps) {
  const router = useRouter();

  const [serverError, setServerError] =
    useState("");

  const [latitude, setLatitude] =
    useState<number | null>(
      profile.latitude
    );

  const [longitude, setLongitude] =
    useState<number | null>(
      profile.longitude
    );


  const {
    register,
    handleSubmit,
    setValue,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(
      UpdateProfileSchema
    ),

    defaultValues: {
      username: profile.username,
      fullName: profile.fullName,
      bio: profile.bio ?? "",
      city: profile.city ?? "",
      swapRadius: profile.swapRadius ?? 10,
    },
  });


  async function onSubmit(
    data: UpdateProfileFormData
  ) {
    setServerError("");

    const response = await fetch(
      "/api/profile",
      {
        method: "PATCH",
        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          ...data,
          latitude,
          longitude,
        }),
      }
    );


    const result =
      await response.json();


    if (!response.ok) {
      setServerError(
        result.error ??
          "Failed to update profile."
      );

      return;
    }


    router.refresh();
    router.push("/profile");
  }


  return (
    <main className={styles.container}>

      <AvatarUploader profile={profile} />


      <form
        className={styles.form}
        onSubmit={handleSubmit(onSubmit)}
      >

        <TextField
          id="username"
          label="Username"
          icon={User}
          placeholder="Enter your username"
          error={errors.username?.message}
          disabled={isSubmitting}
          {...register("username")}
        />


        <TextField
          id="fullName"
          label="Full Name"
          icon={User}
          placeholder="Enter your full name"
          error={errors.fullName?.message}
          disabled
          {...register("fullName")}
        />


        <TextArea
          id="bio"
          label="Bio"
          icon={BadgeInfo}
          rows={4}
          placeholder="Tell swap partners a bit about yourself..."
          error={errors.bio?.message}
          disabled={isSubmitting}
          {...register("bio")}
        />


        <TextField
          id="city"
          label="City"
          icon={MapPin}
          placeholder="Quezon City"
          error={errors.city?.message}
          disabled={isSubmitting}
          {...register("city")}
        />


        <TextField
          id="swapRadius"
          label="Swap Radius (km)"
          icon={LocateFixed}
          type="number"
          placeholder="10"
          error={errors.swapRadius?.message}
          disabled={isSubmitting}
          {...register("swapRadius", {
            valueAsNumber: true,
          })}
        />


        <LocationCard
          latitude={latitude}
          longitude={longitude}
          city={profile.city}
          onLocationChange={(location) => {
            setLatitude(location.latitude);
            setLongitude(location.longitude);

            setValue(
              "city",
              location.city
            );
          }}
        />


        {serverError && (
          <p className={styles.error}>
            {serverError}
          </p>
        )}


        <button
          type="submit"
          className={styles.saveButton}
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Saving..."
            : "Save Changes"}
        </button>

      </form>

    </main>
  );
}
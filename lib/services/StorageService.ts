import { createClient } from "@/utils/supabase/client";

export async function uploadListingImages(
  images: File[]
): Promise<string[]> {
  const supabase = createClient();

  const imageUrls: string[] = [];

  try {
    for (const image of images) {
      const extension =
        image.name
          .split(".")
          .pop()
          ?.toLowerCase() ?? "jpg";

      const fileName =
        `${crypto.randomUUID()}.${extension}`;

      const { error } =
        await supabase.storage
          .from("listing-images")
          .upload(fileName, image);

      if (error) {
        throw new Error(error.message);
      }

      const {
        data: { publicUrl },
      } = supabase.storage
        .from("listing-images")
        .getPublicUrl(fileName);

      imageUrls.push(publicUrl);
    }

    return imageUrls;
  } catch (error) {
    if (imageUrls.length > 0) {
      try {
        await deleteListingImages(imageUrls);
      } catch {}
    }

    throw error;
  }
}

export async function deleteListingImages(
  imageUrls: string[]
) {
  const supabase = createClient();

  const filePaths = imageUrls
    .map((url) => {
      const index = url.indexOf("/listing-images/");

      if (index === -1) return null;

      return url.substring(
        index + "/listing-images/".length
      );
    })
    .filter(Boolean) as string[];

  if (filePaths.length === 0) {
    return;
  }

  const { error } = await supabase.storage
    .from("listing-images")
    .remove(filePaths);

  if (error) {
    throw new Error(error.message);
  }
}

export async function uploadNewListingImages(
  existingImages: string[],
  newImages: File[]
): Promise<string[]> {
  const uploaded =
    await uploadListingImages(newImages);

  return [
    ...existingImages,
    ...uploaded,
  ];
}
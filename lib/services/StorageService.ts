import { createClient } from "@/utils/supabase/client";

export async function uploadListingImages(
  images: File[]
): Promise<string[]> {
  const supabase = createClient();

  const imageUrls: string[] = [];

  for (const image of images) {
    const fileName = `${crypto.randomUUID()}-${image.name}`;

    const { error } = await supabase.storage
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
}
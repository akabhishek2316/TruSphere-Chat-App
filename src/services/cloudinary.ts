export const CLOUD_NAME =
  process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME!;

export const UPLOAD_PRESET =
  process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

export async function uploadImage(uri: string) {

  const formData = new FormData();

  formData.append("file", {
    uri,
    type: "image/jpeg",
    name: "profile.jpg",
  } as any);

  formData.append("upload_preset", UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await response.json();

  console.log("Cloudinary:", data);

  if (!data.secure_url) {
    throw new Error(JSON.stringify(data));
  }

  return data.secure_url;
}



export async function uploadVoice(uri: string) {
  const formData = new FormData();

  formData.append("file", {
    uri,
    type: "audio/m4a",
    name: "voice.m4a",
  } as any);

  formData.append("upload_preset", UPLOAD_PRESET);


 console.log("Cloudinary Request Started");

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

   console.log("Cloudinary Request Started");

  const data = await response.json();

  console.log("Voice Upload:", data);

  if (!data.secure_url) {
    throw new Error(JSON.stringify(data));
  }

  return data.secure_url;
}
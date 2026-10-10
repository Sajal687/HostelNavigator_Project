// Hostel images arrive either as base64 strings (search API) or as legacy
// { data: { data: number[] } } Buffer JSON (GET /hostels/:id). Normalise both to base64.
const bytesToBase64 = (bytes) => {
  let binary = "";
  const view = new Uint8Array(bytes);
  for (let i = 0; i < view.byteLength; i++) {
    binary += String.fromCharCode(view[i]);
  }
  return window.btoa(binary);
};

export const toBase64Images = (images = []) =>
  images
    .map((img) => {
      if (typeof img === "string") return img;
      if (img?.data?.data) return bytesToBase64(img.data.data);
      return null;
    })
    .filter(Boolean);

export const imageSrc = (base64) => (base64 ? `data:image/jpeg;base64,${base64}` : undefined);

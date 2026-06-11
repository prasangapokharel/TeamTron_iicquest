import type { EsewaInitResponse } from "@/types/api";

/** Auto-submit hidden form to eSewa checkout (per backend integration guide). */
export function redirectToEsewa(data: EsewaInitResponse) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = data.esewa_url;

  Object.entries(data.fields).forEach(([key, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = String(value);
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
}

export function formatPaymentMethod(name: string) {
  if (name.toLowerCase() === "esewa") return "eSewa";
  return name.charAt(0).toUpperCase() + name.slice(1);
}

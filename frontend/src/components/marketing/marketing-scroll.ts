const ANCHOR_OFFSET = 16;

export function parseSectionId(hash: string) {
  const cleaned = hash.replace(/^#+/, "").split("#").filter(Boolean)[0];
  return cleaned ?? "";
}

export function getMarketingNavHeight() {
  const nav = document.querySelector(".marketing-nav");
  return nav?.getBoundingClientRect().height ?? 64;
}

export function setMarketingNavHeightVar() {
  const height = getMarketingNavHeight();
  document.documentElement.style.setProperty(
    "--marketing-nav-height",
    `${height}px`
  );
}

export function setMarketingHash(sectionId: string) {
  const path = window.location.pathname;
  const search = window.location.search;
  window.history.replaceState(null, "", `${path}${search}#${sectionId}`);
}

export function scrollToMarketingSection(hash: string, smooth = true) {
  const id = parseSectionId(hash);
  if (!id) return false;

  const el = document.getElementById(id);
  if (!el) return false;

  const offset = getMarketingNavHeight() + ANCHOR_OFFSET;
  const top = el.getBoundingClientRect().top + window.scrollY - offset;

  window.scrollTo({
    top: Math.max(0, top),
    behavior: smooth ? "smooth" : "auto",
  });

  return true;
}

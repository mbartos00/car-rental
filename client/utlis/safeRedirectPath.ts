const safeRedirectPath = (value: string | null | undefined): string | null => {
  if (
    typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//")
  ) {
    return value;
  }

  return null;
};

export default safeRedirectPath;

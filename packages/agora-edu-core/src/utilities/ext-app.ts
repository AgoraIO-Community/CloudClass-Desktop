export const escapeExtAppIdentifier = (appIdentifier: string) => {
  return appIdentifier.replace(/\./g, "_")
}
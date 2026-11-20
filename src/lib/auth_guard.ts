export function isAdminUser(email?: string | null): boolean {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    return true;
  }
  if (!email) {
    return false;
  }
  return email.toLowerCase() === adminEmail.toLowerCase();
}

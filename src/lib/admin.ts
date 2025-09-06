import { authClient } from "./auth-client";

const ADMIN_USER_ID = "VmJDso30i3zQ2cl8AcEupL21pc0v6Oya";

export function isAdmin(userId: string | undefined): boolean {
  return userId === ADMIN_USER_ID;
}

export function useIsAdmin(): boolean {
  const { data: session } = authClient.useSession();
  return isAdmin(session?.user?.id);
}

export function requireAdmin() {
  const { data: session } = authClient.useSession();
  
  if (!session?.user?.id) {
    throw new Error("Authentication required");
  }
  
  if (!isAdmin(session.user.id)) {
    throw new Error("Admin access required");
  }
  
  return session;
}

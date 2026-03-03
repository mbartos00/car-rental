import LoginForm from "@/components/LoginForm";
import { ROUTES } from "@/constants/routes";
import safeRedirectPath from "@/utlis/safeRedirectPath";
import { headers } from "next/headers";

export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const fromParam = safeRedirectPath((await searchParams).from);

  const headerStore = await headers();
  const referer = headerStore.get("referer");
  const host = headerStore.get("host");

  let refererPath = null;

  if (referer && host && URL.canParse(referer)) {
    const refererUrl = new URL(referer);

    if (refererUrl.host === host && refererUrl.pathname !== ROUTES.LOGIN) {
      refererPath = refererUrl.pathname + refererUrl.search;
    }
  }

  const from = fromParam ?? refererPath ?? ROUTES.HOME;

  return (
    <div className="flex min-h-[80svh] items-center justify-center p-4 lg:p-8">
      <LoginForm from={from} />
    </div>
  );
}

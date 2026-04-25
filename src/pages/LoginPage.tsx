import { useState } from "react";
import LiveStudioAuth from "../components/auth/LiveStudioAuth";
import { useLogin, useGoogleUrl } from "../api/useAuth";
import { getApiErrorMessage } from "../types/api";

export default function LoginPage() {
  const [error, setError] = useState("");
  const login = useLogin();
  const { data: googleData } = useGoogleUrl();

  const onSubmit = async ({ email, password }: { email: string; password: string }) => {
    setError("");
    try {
      await login.mutateAsync({ email, password });
      window.location.replace("/");
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Invalid username or password."));
    }
  };

  return (
    <LiveStudioAuth
      mode="login"
      onSubmit={onSubmit}
      onGoogle={() => { if (googleData?.url) window.location.href = googleData.url; }}
      submitting={login.isPending}
      error={error}
    />
  );
}

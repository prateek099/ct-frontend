import { useState } from "react";
import LiveStudioAuth from "../components/auth/LiveStudioAuth";
import { useRegister, useLogin, useGoogleUrl } from "../api/useAuth";
import { getApiErrorMessage } from "../types/api";

export default function SignupPage() {
  const [error, setError] = useState("");
  const register = useRegister();
  const login = useLogin();
  const { data: googleData } = useGoogleUrl();

  const onSubmit = async ({ name, email, password }: { name?: string; email: string; password: string }) => {
    setError("");
    try {
      await register.mutateAsync({ name: name || "", email, password });
      await login.mutateAsync({ email, password });
      window.location.replace("/dashboard");
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to create account."));
    }
  };

  return (
    <LiveStudioAuth
      mode="signup"
      onSubmit={onSubmit}
      onGoogle={() => { if (googleData?.url) window.location.href = googleData.url; }}
      submitting={register.isPending || login.isPending}
      error={error}
    />
  );
}

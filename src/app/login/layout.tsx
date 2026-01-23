import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login / Sign Up | Echo: The Bridge",
  description:
    "Access your Echo: The Bridge account or create a new one to start bridging your vision to reality.",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

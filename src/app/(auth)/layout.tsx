// Sign-in pages have their own split-screen frame and no site header or footer.
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return children;
}

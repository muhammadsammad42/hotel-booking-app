import { PageTransition } from "@/components/motion/page-transition";

export default function AdminTemplate({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}

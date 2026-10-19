import type { Metadata } from "next";
import { MailIcon } from "lucide-react";

import { AvatarForm, NameForm, PasswordForm } from "@/components/account/profile-forms";
import { requireUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Profile",
  robots: { index: false },
};

const memberSince = new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric" });

function Panel({ id, title, description, children }: { id: string; title: string; description: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="grid gap-5 rounded-2xl border bg-card p-5 sm:p-6 md:grid-cols-[14rem_1fr] md:gap-8">
      <div>
        <h2 id={id} className="type-title-md">
          {title}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

export default async function ProfilePage() {
  const user = await requireUser("/account/profile");
  const [record, stays, reviews] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: user.id }, select: { name: true, email: true, image: true, createdAt: true, passwordHash: true } }),
    prisma.booking.count({ where: { userId: user.id, status: "CHECKED_OUT" } }),
    prisma.review.count({ where: { userId: user.id } }),
  ]);

  const stats = [
    { label: "Member since", value: memberSince.format(record.createdAt) },
    { label: stays === 1 ? "Stay completed" : "Stays completed", value: String(stays) },
    { label: reviews === 1 ? "Review written" : "Reviews written", value: String(reviews) },
  ];

  return (
    <div className="grid gap-8">
      <header>
        <h1 className="type-title-lg">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">How you appear to hotels, and how you sign in.</p>
      </header>

      <dl className="grid grid-cols-3 divide-x rounded-2xl border bg-card">
        {stats.map((stat) => (
          <div key={stat.label} className="grid gap-0.5 px-3 py-4 text-center sm:px-5">
            <dt className="order-2 text-xs text-muted-foreground sm:text-sm">{stat.label}</dt>
            <dd className="order-1 text-base font-semibold tabular-nums sm:text-xl">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <Panel id="photo-heading" title="Photo" description="Shown in the header and next to your reviews.">
        <AvatarForm name={record.name} email={record.email} image={record.image} />
      </Panel>

      <Panel id="details-heading" title="Personal details" description="Used on new bookings. Existing bookings keep the name they were made with.">
        <div className="grid gap-5">
          <NameForm name={record.name ?? ""} />
          <div className="grid gap-1 border-t pt-5">
            <p className="text-sm font-medium">Email</p>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <MailIcon className="size-4" aria-hidden />
              {record.email}
            </p>
            <p className="text-sm text-muted-foreground">You sign in with this address. It cannot be changed yet.</p>
          </div>
        </div>
      </Panel>

      {record.passwordHash && (
        <Panel id="password-heading" title="Password" description="Use at least 8 characters. A short phrase is easy to remember and hard to guess.">
          <PasswordForm />
        </Panel>
      )}
    </div>
  );
}

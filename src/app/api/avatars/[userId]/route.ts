import { prisma } from "@/lib/prisma";

/**
 * A user's profile photo. Photos appear beside public reviews, so this is
 * public. The URL carries a version (?v=), so a photo can be cached forever.
 */
export async function GET(_request: Request, { params }: RouteContext<"/api/avatars/[userId]">) {
  const { userId } = await params;
  if (userId.length > 64) return new Response(null, { status: 404 });

  const avatar = await prisma.userAvatar.findUnique({ where: { userId } });
  if (!avatar) return new Response(null, { status: 404 });

  return new Response(new Uint8Array(avatar.data), {
    headers: {
      "Content-Type": avatar.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

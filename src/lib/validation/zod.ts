import { z } from "zod";

// Zod can compile schemas with new Function() for speed. The site's
// Content-Security-Policy does not allow eval, so Zod would probe for it and
// the browser would log a CSP violation. The interpreted mode is plenty fast.
z.config({ jitless: true });

export { z };

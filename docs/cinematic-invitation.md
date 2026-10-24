# Cinematic invitation

`public/assets/WeddingInvitation.js` exports a React 18+ component using native ES modules, with no JSX compiler requirement. Load `public/assets/invitation.css` alongside it. Preview `/cinematic-invitation.html` on the local development server, or any static server rooted at `public`. The preview uses pinned React imports from esm.sh and needs internet access. The host application should use its own bundled React.

```jsx
import WeddingInvitation from './assets/WeddingInvitation.js';
import './assets/invitation.css';

<WeddingInvitation
  groom="Youssef" bride="Meriem"
  date="24 octobre 2026" time="18:00"
  venue="Dar El Jeld" city="Tunis"
  families="Les familles des mariés"
  message="Nous avons la joie de vous convier au mariage de nos enfants."
  openingVideoUrl="/assets/openings/opening.mp4"
  envelopeVideoUrl="/assets/openings/envelope-open.mp4"
  openings={window.ReefqInvite.OPENINGS}
/>
```

The preview loads `engine.js` to supply the canonical Quranic text. Outside Reefq, pass `openings` explicitly with the canonical `bismillah: { ar: … }` and `naba: { ar: … }` objects; the component does not duplicate or modify that text. Optional `openingPosterUrl` and `envelopePosterUrl` accept themed poster images.

All eight text props also accept URL parameters; explicit props win, including empty strings. `search` optionally overrides the query string, including for server rendering. Example:

```text
/cinematic-invitation.html?groom=Youssef&bride=Meriem&date=24%20octobre%202026&time=18%3A00&venue=Dar%20El%20Jeld&city=Tunis
```

Video URLs are props only. React escapes text and the Maps query is encoded. Groom appears first. Arabic blocks receive RTL and Arabic language attributes. Date and time strings display as supplied, with no timezone conversion or month renaming.

Both video elements remain mounted with `preload="auto"`, `muted`, and `playsInline`. Playback starts directly in the seal click handler. They play once in order. The opening's final frame remains visible until the reveal starts playing. The overlay fades away for 650 ms, then unmounts.

The root `data-stage` exposes `seal → video → envelope → done`. Skip, Escape during playback, rejected playback, active media errors, twelve seconds without progress, or a sixty-second per-clip safety limit reveal the card. `stallTimeoutMs` customizes the progress timeout. Inactive preload failures leave the initial seal visible. Reduced motion retains the seal, then reveals the card directly on click.

Pass `children` to reveal an existing invitation instead of the sample card. Keep authenticated data, grammar, RSVP and guest links in the host app. Query parameters in this standalone preview are not authenticated invitation data. Use one instance per page and remount with a new React `key` when changing couples or themes during playback.

The supplied clips are unchanged. Muting playback does not remove encoded audio tracks. Encoding, exact frame matching and playback on physical iOS/Android devices need a media/device check. No production guest route or dependency manifest is modified.

Validation: `npm.cmd run guard`, `npm.cmd test`, and `git diff --check` passed. Headless Chrome with locally cached React 19.3 passed real playback of both clips, Skip, active errors on each clip, rejected playback, the stall watchdog, reduced motion, Maps encoding, and Arabic at 360 px without horizontal overflow. Screenshots and the local browser check are under the ignored `tools/promo/out/` directory. The sandbox blocks the preview's CDN, so that import path was intercepted with the local React runtime for browser verification; the preview itself still requires CDN access. Physical iOS/Android testing remains outstanding.

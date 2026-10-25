import React, { useEffect, useRef, useState } from 'react';

const h = React.createElement;
const fields = ['groom', 'bride', 'date', 'time', 'venue', 'city', 'families', 'message'];
const defaults = {
  groom: 'Youssef', bride: 'Meriem', date: '', time: '', venue: '', city: '',
  families: '', message: 'Entourés de leurs familles, ils ont la joie de vous convier à leur mariage.',
};
const language = text => /[\u0600-\u06ff]/u.test(text || '')
  ? { lang: 'ar', dir: 'rtl' } : { lang: 'fr', dir: 'ltr' };

export function invitationData(props = {}, search = '') {
  const params = new URLSearchParams(search);
  return Object.fromEntries(fields.map(key => [key,
    String(props[key] ?? params.get(key) ?? defaults[key]),
  ]));
}

/** React 18+. Load invitation.css. Props override URL parameters, including empty strings.
 * Pass children to reveal an existing invitation instead of the default card.
 * Never use query parameters as a replacement for authenticated invitation data.
 */
export default function WeddingInvitation(props = {}) {
  const {
    openingVideoUrl = '/assets/openings/opening.mp4',
    envelopeVideoUrl = '/assets/openings/envelope-open.mp4',
    openingPosterUrl, envelopePosterUrl, children,
    search = typeof window === 'undefined' ? '' : window.location.search,
    stallTimeoutMs = 12000,
  } = props;
  const data = invitationData(props, search);
  const [stage, setStage] = useState('seal');
  const current = useRef('seal');
  const [overlayVisible, setOverlayVisible] = useState(true);
  const [envelopeReady, setEnvelopeReady] = useState(false);
  const opening = useRef(null);
  const envelope = useRef(null);
  const card = useRef(null);
  const skip = useRef(null);
  const reducedMotion = useRef(false);

  function finish() {
    if (current.current === 'done') return;
    current.current = 'done';
    opening.current?.pause();
    envelope.current?.pause();
    setStage('done');
  }

  function play(video) {
    if (!video || !video.getAttribute('src')) return finish();
    try {
      // Called directly inside the seal click for the opening: retain user activation.
      video.muted = false;
      const request = video.play();
      request?.catch(() => {
        if (current.current !== 'done') finish();
      });
    } catch {
      finish();
    }
  }

  function begin() {
    if (current.current !== 'seal') return;
    if (reducedMotion.current) return finish();
    current.current = 'video';
    setStage('video');
    play(opening.current);
  }

  function revealEnvelope() {
    if (current.current !== 'video') return;
    current.current = 'envelope';
    setStage('envelope');
    play(envelope.current);
  }

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotion.current = media.matches;
    const update = () => {
      reducedMotion.current = media.matches;
      if (media.matches && ['video', 'envelope'].includes(current.current)) finish();
    };
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (stage === 'done') return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [stage === 'done']);

  useEffect(() => {
    if (stage === 'seal') return;
    if (stage === 'done') {
      card.current?.focus({ preventScroll: true });
      const timer = window.setTimeout(() => setOverlayVisible(false), 700);
      return () => window.clearTimeout(timer);
    }
    skip.current?.focus({ preventScroll: true });
    const video = stage === 'video' ? opening.current : envelope.current;
    let lastTime = video?.currentTime || 0;
    let lastProgress = performance.now();
    const started = lastProgress;
    // A rejected play(), media error, or network stall must never trap the guest.
    const timer = window.setInterval(() => {
      const now = performance.now();
      if (video && video.currentTime > lastTime) {
        lastTime = video.currentTime;
        lastProgress = now;
      }
      if (now - lastProgress > Math.max(1000, stallTimeoutMs) || now - started > 60000) finish();
    }, 500);
    return () => window.clearInterval(timer);
  }, [stage, stallTimeoutMs]);

  useEffect(() => {
    const videos = [opening.current, envelope.current];
    return () => videos.forEach(video => video?.pause());
  }, []);

  const initials = [data.groom, data.bride].map(name => Array.from(name.trim())[0] || '').join(' · ');
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([data.venue, data.city].filter(Boolean).join(', '))}`;
  const videoError = expected => { if (current.current === expected) finish(); };
  // Existing canonical opening strings are supplied by engine.js or by the host app.
  const openings = props.openings ?? globalThis.ReefqInvite?.OPENINGS;

  return h('div', { className: 'rq-cinema', 'data-stage': stage },
    h('main', {
      ref: card, tabIndex: -1, className: 'rq-cinema-card',
      hidden: stage !== 'done', lang: 'fr',
    }, children ?? h(React.Fragment, null,
      h('p', { className: 'rq-cinema-eyebrow' }, 'Une invitation, une belle histoire'),
      openings?.naba && h('p', { className: 'rq-cinema-verse', lang: 'ar', dir: 'rtl' }, openings.naba.ar),
      h('h1', null,
        h('bdi', language(data.groom), data.groom),
        h('span', { className: 'rq-cinema-and' }, '&'),
        h('bdi', language(data.bride), data.bride)),
      data.families && h('p', { className: 'rq-cinema-families', ...language(data.families) }, data.families),
      h('p', { className: 'rq-cinema-message', ...language(data.message) }, data.message),
      h('div', { className: 'rq-cinema-details' },
        data.date && h('p', null, h('span', null, 'Le jour'), h('span', language(data.date), data.date)),
        data.time && h('p', null, h('span', null, 'À partir de'), h('span', null, data.time)),
        (data.venue || data.city) && h('p', null,
          h('span', null, 'Le lieu'),
          h('bdi', language(data.venue), data.venue), h('bdi', language(data.city), data.city))),
      (data.venue || data.city) && h('a', {
        className: 'rq-cinema-map', href: maps, target: '_blank', rel: 'noopener noreferrer',
      }, 'Voir l’itinéraire ↗'),
      h('p', { className: 'rq-cinema-note' }, 'Merci de conserver cette invitation avec respect.'))),
    overlayVisible && h('div', {
      className: 'rq-cinema-overlay', 'aria-hidden': stage === 'done' ? true : undefined,
      onKeyDown: event => { if (event.key === 'Escape' && current.current !== 'seal') finish(); },
    },
    h('video', {
      ref: opening, className: 'rq-cinema-video rq-cinema-opening',
      src: openingVideoUrl, poster: openingPosterUrl, muted: false, playsInline: true,
      preload: 'auto', disablePictureInPicture: true, tabIndex: -1, 'aria-hidden': true,
      onEnded: revealEnvelope, onError: () => videoError('video'),
    }),
    h('video', {
      ref: envelope, className: `rq-cinema-video rq-cinema-envelope${envelopeReady ? ' is-ready' : ''}`,
      src: envelopeVideoUrl, poster: envelopePosterUrl, muted: false, playsInline: true,
      preload: 'auto', disablePictureInPicture: true, tabIndex: -1, 'aria-hidden': true,
      onPlaying: () => setEnvelopeReady(true),
      onEnded: () => { if (current.current === 'envelope') finish(); },
      onError: () => videoError('envelope'),
    }),
    h('div', { className: 'rq-cinema-seal-screen' },
      h('p', { className: 'rq-cinema-eyebrow' }, 'Vous êtes invités'),
      h('button', {
        type: 'button', className: 'rq-cinema-seal', onClick: begin,
        disabled: stage !== 'seal', tabIndex: stage === 'seal' ? 0 : -1,
        'aria-label': 'Ouvrir l’invitation',
      },
      h('span', { className: 'rq-cinema-monogram', ...language(initials) }, initials),
      openings?.bismillah && h('span', { className: 'rq-cinema-basmala', lang: 'ar', dir: 'rtl' }, openings.bismillah.ar)),
      h('p', { className: 'rq-cinema-hint' }, 'Touchez le sceau pour ouvrir')),
    h('button', {
      ref: skip, className: 'rq-cinema-skip', type: 'button', onClick: finish,
      hidden: stage === 'seal' || stage === 'done',
    }, 'Passer')));
}

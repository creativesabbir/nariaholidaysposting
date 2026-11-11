import React from 'react';

export function TikTokIcon({ className = "w-4 h-4", ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 2.89 3.5 2.77 1.81-.1 3.25-1.57 3.25-3.38V.02h-.03z"/>
    </svg>
  );
}

export function InstagramIcon({ className = "w-4 h-4", ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

export function LinkedinIcon({ className = "w-4 h-4", ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
    </svg>
  );
}

export function YoutubeIcon({ className = "w-4 h-4", ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

export function FacebookIcon({ className = "w-4 h-4", ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

export function TwitterIcon({ className = "w-4 h-4", ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

export function PinterestIcon({ className = "w-4 h-4", ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 0a12 12 0 0 0-4.37 23.17c-.07-.94-.13-2.39.03-3.42l1-4.22s-.25-.51-.25-1.26c0-1.18.68-2.06 1.54-2.06.72 0 1.07.54 1.07 1.19 0 .73-.46 1.82-.71 2.82-.2.85.42 1.54 1.26 1.54 1.51 0 2.67-1.59 2.67-3.89 0-2.03-1.46-3.45-3.54-3.45-2.42 0-3.83 1.81-3.83 3.68 0 .73.28 1.51.63 1.94a.25.25 0 0 1 .06.24c-.06.27-.21.85-.24.97-.04.16-.13.2-.3.12-1.11-.52-1.81-2.14-1.81-3.45 0-2.81 2.04-5.39 5.89-5.39 3.09 0 5.5 2.2 5.5 5.15 0 3.07-1.94 5.54-4.63 5.54-.9 0-1.76-.47-2.05-1.02l-.56 2.13c-.2.78-.75 1.76-1.12 2.36A12 12 0 1 0 12 0z"/>
    </svg>
  );
}

export function RedditIcon({ className = "w-4 h-4", ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.703zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.197-2.512-.73a.326.326 0 0 0-.232-.095z"/>
    </svg>
  );
}

export function ThreadsIcon({ className = "w-4 h-4", ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12.186 24C5.466 24 0 18.534 0 11.814 0 5.093 5.466 0 12.186 0c6.643 0 11.963 5.253 12.174 11.879h-2.915c-.206-5.01-4.28-9.083-9.259-9.083-5.112 0-9.27 4.158-9.27 9.27 0 5.113 4.158 9.271 9.27 9.271 4.545 0 8.358-3.328 9.13-7.723h2.935c-.812 6.002-5.962 10.487-12.065 10.487zm.436-15.65c-2.38 0-4.184 1.76-4.184 4.08 0 2.44 1.956 4.148 4.604 4.148 1.488 0 2.766-.543 3.6-1.531l2.062 1.637c-1.299 1.621-3.327 2.593-5.662 2.593-4.218 0-7.397-2.885-7.397-6.847 0-3.905 3.094-6.779 7.042-6.779 3.518 0 6.29 2.298 6.786 5.626h-2.81c-.426-1.785-1.989-2.927-3.976-2.927zm-.065 5.568c-1.07 0-1.876-.745-1.876-1.748 0-.987.794-1.734 1.876-1.734 1.096 0 1.889.747 1.889 1.734 0 1.003-.805 1.748-1.889 1.748z"/>
    </svg>
  );
}

export function BlueskyIcon({ className = "w-4 h-4", ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566 1.01 1.458 1.457.778 2.083.097 2.71 0 4.025 0 5.4c0 3.332 1.585 10.158 2.457 12.016 1.464 3.12 4.417 3.584 6.837 1.784-2.83 1.93-3.618 4.288-1.572 4.77 4.137.974 6.278-6.17 6.278-6.17s2.14 7.144 6.278 6.17c2.046-.482 1.258-2.84-1.572-4.77 2.42 1.8 5.373 1.336 6.837-1.784C22.415 15.558 24 8.732 24 5.4c0-1.375-.097-2.69-.778-3.317-.68-.626-1.788-1.073-4.424.722-2.752 1.942-5.711 5.88-6.798 7.995z"/>
    </svg>
  );
}

export function DiscordIcon({ className = "w-4 h-4", ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  );
}

export function TelegramIcon({ className = "w-4 h-4", ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
  );
}

export function GoogleBusinessIcon({ className = "w-4 h-4", ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
    </svg>
  );
}

export function SlackIcon({ className = "w-4 h-4", ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
    </svg>
  );
}

export function WhopIcon({ className = "w-4 h-4", ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <rect x="0" y="0" width="24" height="24" rx="5.5" fill="currentColor" />
      <path d="M5 7 L8.4 17 L12 10.6 L15.6 17 L19 7" fill="none" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ListmonkIcon({ className = "w-4 h-4", ...props }) {
  return (
    <svg className={className} viewBox="0 0 512 512" fill="currentColor" {...props}>
      <path d="M500 20 12 262l190 58-16 168 96-112 150 110zM202 320 452 78 262 288z"/>
    </svg>
  );
}

export function TumblrIcon({ className = "w-4 h-4", ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M14.7 24c-4.2 0-7-3-7-6.8v-6.8H5.1V6.4c2.9-1.3 4.6-3.6 4.9-6.4h3.7v6.2h4.8v4.2h-4.8v6.5c0 1.9.6 2.9 2.1 2.9.8 0 1.4-.2 2.1-.6l1.1 3.7c-1 .6-2.5 1.1-4.3 1.1z"/>
    </svg>
  );
}

export function FacebookGlobeIcon({ className = "w-3 h-3 text-[#65676B]", ...props }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 16 16" 
      fill="currentColor" 
      aria-label="Shared with Public"
      {...props}
    >
      <path fillRule="evenodd" clipRule="evenodd" d="M8 1a7 7 0 100 14A7 7 0 008 1zM2.05 8a5.95 5.95 0 01.37-2.05l2.03 2.03a1.5 1.5 0 001.06.44h.74v1.5a.75.75 0 01-.75.75h-1a.75.75 0 00-.75.75v.52A5.96 5.96 0 012.05 8zm8.6 4.67a.75.75 0 00.35-.67v-.75a1.5 1.5 0 00-1.5-1.5h-1.5v-1a.75.75 0 01.75-.75h1.5a1.5 1.5 0 001.5-1.5v-.25c0-.12.03-.23.08-.34a5.96 5.96 0 01.62 4.01 5.98 5.98 0 01-1.8 2.75zm1.26-6.68c-.1-.1-.23-.17-.36-.21V5.5a.75.75 0 01-.75-.75v-1a.75.75 0 00-.75-.75h-.5a.75.75 0 01-.75-.75v-.86a5.96 5.96 0 013.11 3.31z"/>
    </svg>
  );
}

export const PLATFORM_INFO = {
  tiktok: { name: 'TikTok', icon: TikTokIcon, color: 'text-slate-900', bg: 'bg-slate-100 hover:bg-slate-200' },
  instagram: { name: 'Instagram', icon: InstagramIcon, color: 'text-pink-600', bg: 'bg-pink-50 hover:bg-pink-100' },
  ig: { name: 'Instagram', icon: InstagramIcon, color: 'text-pink-600', bg: 'bg-pink-50 hover:bg-pink-100' },
  linkedin: { name: 'LinkedIn', icon: LinkedinIcon, color: 'text-blue-600', bg: 'bg-blue-50 hover:bg-blue-100' },
  youtube: { name: 'YouTube', icon: YoutubeIcon, color: 'text-red-600', bg: 'bg-red-50 hover:bg-red-100' },
  yt: { name: 'YouTube', icon: YoutubeIcon, color: 'text-red-600', bg: 'bg-red-50 hover:bg-red-100' },
  facebook: { name: 'Facebook', icon: FacebookIcon, color: 'text-blue-600', bg: 'bg-blue-50 hover:bg-blue-100' },
  fb: { name: 'Facebook', icon: FacebookIcon, color: 'text-blue-600', bg: 'bg-blue-50 hover:bg-blue-100' },
  x: { name: 'X', icon: TwitterIcon, color: 'text-slate-900', bg: 'bg-slate-100 hover:bg-slate-200' },
  twitter: { name: 'X', icon: TwitterIcon, color: 'text-slate-900', bg: 'bg-slate-100 hover:bg-slate-200' },
  pinterest: { name: 'Pinterest', icon: PinterestIcon, color: 'text-red-600', bg: 'bg-red-50 hover:bg-red-100' },
  reddit: { name: 'Reddit', icon: RedditIcon, color: 'text-orange-600', bg: 'bg-orange-50 hover:bg-orange-100' },
  threads: { name: 'Threads', icon: ThreadsIcon, color: 'text-slate-900', bg: 'bg-slate-100 hover:bg-slate-200' },
  bluesky: { name: 'Bluesky', icon: BlueskyIcon, color: 'text-sky-500', bg: 'bg-sky-50 hover:bg-sky-100' },
  discord: { name: 'Discord', icon: DiscordIcon, color: 'text-indigo-600', bg: 'bg-indigo-50 hover:bg-indigo-100' },
  telegram: { name: 'Telegram', icon: TelegramIcon, color: 'text-sky-500', bg: 'bg-sky-50 hover:bg-sky-100' },
  google_business: { name: 'Google Business', icon: GoogleBusinessIcon, color: 'text-blue-500', bg: 'bg-blue-50 hover:bg-blue-100' },
  slack: { name: 'Slack', icon: SlackIcon, color: 'text-[#611f69]', bg: 'bg-purple-50 hover:bg-purple-100' },
  whop: { name: 'Whop', icon: WhopIcon, color: 'text-[#FF6243]', bg: 'bg-orange-50 hover:bg-orange-100' },
  listmonk: { name: 'Listmonk', icon: ListmonkIcon, color: 'text-[#00A98F]', bg: 'bg-emerald-50 hover:bg-emerald-100' },
  tumblr: { name: 'Tumblr', icon: TumblrIcon, color: 'text-[#36465D]', bg: 'bg-slate-100 hover:bg-slate-200' }
};

export const ALL_SOCIAL_PLATFORMS = [
  { id: 'tiktok', name: 'TikTok', icon: TikTokIcon, color: 'text-slate-900', defaultEnabled: true },
  { id: 'instagram', name: 'Instagram', icon: InstagramIcon, color: 'text-pink-600', defaultEnabled: true },
  { id: 'linkedin', name: 'LinkedIn', icon: LinkedinIcon, color: 'text-blue-600', defaultEnabled: true },
  { id: 'youtube', name: 'YouTube', icon: YoutubeIcon, color: 'text-red-600', defaultEnabled: true },
  { id: 'facebook', name: 'Facebook', icon: FacebookIcon, color: 'text-blue-600', defaultEnabled: true },
  { id: 'x', name: 'X', adminName: 'X / Twitter', icon: TwitterIcon, color: 'text-slate-900', defaultEnabled: true },
  { id: 'pinterest', name: 'Pinterest', icon: PinterestIcon, color: 'text-red-600', defaultEnabled: true },
  { id: 'reddit', name: 'Reddit', icon: RedditIcon, color: 'text-orange-600', defaultEnabled: true },
  { id: 'threads', name: 'Threads', icon: ThreadsIcon, color: 'text-slate-900', defaultEnabled: true },
  { id: 'bluesky', name: 'Bluesky', icon: BlueskyIcon, color: 'text-sky-500', defaultEnabled: true },
  { id: 'discord', name: 'Discord', icon: DiscordIcon, color: 'text-indigo-600', defaultEnabled: true },
  { id: 'telegram', name: 'Telegram', icon: TelegramIcon, color: 'text-sky-500', defaultEnabled: true },
  { id: 'google_business', name: 'Google Business', icon: GoogleBusinessIcon, color: 'text-blue-500', defaultEnabled: true },
  { id: 'slack', name: 'Slack', icon: SlackIcon, color: 'text-[#611f69]', defaultEnabled: true },
  { id: 'whop', name: 'Whop', icon: WhopIcon, color: 'text-[#FF6243]', defaultEnabled: true },
  { id: 'listmonk', name: 'Listmonk', icon: ListmonkIcon, color: 'text-[#00A98F]', defaultEnabled: true },
  { id: 'tumblr', name: 'Tumblr', icon: TumblrIcon, color: 'text-[#36465D]', defaultEnabled: true }
];

// Media / Post-Type compatibility rules per platform
export const PLATFORM_CAPABILITIES = {
  tiktok: { text: false, image: true, video: true, reason: { text: 'TikTok requires a photo or video post' } },
  instagram: { text: false, image: true, video: true, reason: { text: 'Instagram requires a photo or video post' } },
  linkedin: { text: true, image: true, video: true },
  youtube: { text: false, image: false, video: true, reason: { text: 'YouTube supports video posts only', image: 'YouTube is not available for image posts (video only)' } },
  facebook: { text: true, image: true, video: true },
  x: { text: true, image: false, video: false, reason: { image: 'X / Twitter supports text-only posts', video: 'X / Twitter supports text-only posts' } },
  pinterest: { text: false, image: true, video: true, maxImages: 1, reason: { text: 'Pinterest requires an image or video Pin', multiImage: 'Pinterest supports single image per pin only' } },
  reddit: { text: true, image: true, video: true },
  threads: { text: true, image: true, video: true },
  bluesky: { text: true, image: true, video: true },
  discord: { text: true, image: true, video: true },
  telegram: { text: true, image: true, video: true },
  google_business: { text: true, image: true, video: true, maxImages: 1, reason: { multiImage: 'Google Business profile supports single image only' } },
  slack: { text: true, image: false, video: false, reason: { image: 'Slack supports text posts only', video: 'Slack supports text posts only' } },
  whop: { text: true, image: false, video: false, reason: { image: 'Whop supports text posts only', video: 'Whop supports text posts only' } },
  listmonk: { text: true, image: false, video: false, reason: { image: 'Listmonk supports text posts only', video: 'Listmonk supports text posts only' } },
  tumblr: { text: true, image: true, video: true }
};

function getCapabilityBadge(caps) {
  if (caps.text && !caps.image && !caps.video) return 'Text Only';
  if (!caps.text && !caps.image && caps.video) return 'Video Only';
  if (!caps.text && (caps.image || caps.video)) return 'Media Only';
  return 'Unavailable';
}

export function getPlatformCapabilityStatus(platformId, postType, imageCount = 0, platformSettings = {}) {
  if (platformSettings?.[platformId]?.enabled === false) {
    return { isOff: true, badge: 'Unavailable', reason: 'Disabled in Admin Panel' };
  }

  const caps = PLATFORM_CAPABILITIES[platformId];
  if (!caps) {
    return { isOff: false, badge: null, reason: '' };
  }

  if (caps[postType] === false) {
    return {
      isOff: true,
      badge: getCapabilityBadge(caps),
      reason: caps.reason?.[postType] || `Unavailable for ${postType} posts`
    };
  }

  if (postType === 'image' && caps.maxImages && imageCount > caps.maxImages) {
    return {
      isOff: true,
      badge: `${caps.maxImages} Img Max`,
      reason: caps.reason?.multiImage || `Supports max ${caps.maxImages} image`
    };
  }

  return { isOff: false, badge: null, reason: '' };
}

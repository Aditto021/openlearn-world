// A soft, rounded "clay-style" illustrated scene — young engineers and a
// small companion robot gathered around a big glass screen — reinterpreted in
// this site's own brand palette (coral / teal / yellow), not a trace of any
// third-party artwork. Hand-crafted SVG + CSS animation: no WebGL, no bundle
// weight, no external assets. Every moving part floats on its own staggered
// timing so the scene reads as gently alive rather than mechanically looped.
export default function HeroIllustration() {
  return (
    <svg
      className="hero-illustration"
      viewBox="0 0 600 440"
      role="img"
      aria-label="Young engineers and a small robot building something together at a big screen"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="hiSkin1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f6d1a8" /><stop offset="1" stopColor="#e8b989" /></linearGradient>
        <linearGradient id="hiSkin2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c98a5c" /><stop offset="1" stopColor="#b3703f" /></linearGradient>
        <linearGradient id="hiTeal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6bc4b8" /><stop offset="1" stopColor="#3f978c" /></linearGradient>
        <linearGradient id="hiYellow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f3cf6f" /><stop offset="1" stopColor="#e0af3e" /></linearGradient>
        <linearGradient id="hiCoral" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f0917c" /><stop offset="1" stopColor="#df6a52" /></linearGradient>
        <linearGradient id="hiMauve" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#dba0b8" /><stop offset="1" stopColor="#c47a98" /></linearGradient>
        <linearGradient id="hiNavy" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a4a52" /><stop offset="1" stopColor="#232e34" /></linearGradient>
        <linearGradient id="hiScreen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#eef7f5" /><stop offset="1" stopColor="#d3ece6" /></linearGradient>
        <linearGradient id="hiBot" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#dfe6e4" /></linearGradient>
        <radialGradient id="hiGlow"><stop offset="0" stopColor="#4caaa1" stopOpacity=".5" /><stop offset="1" stopColor="#4caaa1" stopOpacity="0" /></radialGradient>
      </defs>

      {/* Soft background blobs for depth */}
      <circle cx="110" cy="85" r="95" fill="#f1c7b8" opacity=".45" />
      <circle cx="505" cy="330" r="115" fill="#dcefe2" opacity=".5" />
      <circle cx="515" cy="75" r="55" fill="#fbecc7" opacity=".5" />

      {/* Floor shadow */}
      <ellipse cx="300" cy="406" rx="235" ry="15" fill="#dfd9c9" opacity=".55" />

      {/* Sparkles */}
      <g className="hi-twinkle hi-twinkle-a" fill="#eabf64"><path d="M78 55 L84 71 L100 77 L84 83 L78 99 L72 83 L56 77 L72 71 Z" /></g>
      <g className="hi-twinkle hi-twinkle-b" fill="#dd765c"><path d="M552 200 L556 211 L567 215 L556 219 L552 230 L548 219 L537 215 L548 211 Z" /></g>
      <g className="hi-twinkle hi-twinkle-c" fill="#7fae93"><circle cx="60" cy="320" r="4.5" /></g>

      {/* --- Big glass screen ("the huge machine") — a grid of the real course --
          tracks taught on this site, as simple generic icon+label badges. --- */}
      <g className="hi-float hi-float-console">
        <rect x="190" y="88" width="290" height="215" rx="22" fill="url(#hiScreen)" stroke="#bcdbd3" strokeWidth="2" />

        {/* Arduino — each badge's grid position lives on an outer, untouched
            <g>; the CSS float/scale animation lives on an inner <g> at local
            (0,0), so the animation's `transform` never overwrites the SVG
            `transform` attribute that places the badge (they don't compose). */}
        <g transform="translate(219,121)"><g className="hi-badge hi-badge-1">
          <rect width="64" height="64" rx="16" fill="#2f8fd1" />
          <path d="M20 32 a12 12 0 1 1 24 0 a12 12 0 1 1 -24 0" fill="none" stroke="#fff" strokeWidth="3" />
          <circle cx="44" cy="32" r="3" fill="#fff" />
          <text x="32" y="78" textAnchor="middle" fontSize="9" fontWeight="800" fill="#3a4a52">Arduino</text>
        </g></g>
        {/* Blender */}
        <g transform="translate(303,121)"><g className="hi-badge hi-badge-2">
          <rect width="64" height="64" rx="16" fill="#e8894a" />
          <circle cx="32" cy="26" r="11" fill="none" stroke="#fff" strokeWidth="3" />
          <path d="M22 40 L42 40 L32 54 Z" fill="#fff" />
          <text x="32" y="78" textAnchor="middle" fontSize="9" fontWeight="800" fill="#3a4a52">Blender</text>
        </g></g>
        {/* AI */}
        <g transform="translate(387,121)"><g className="hi-badge hi-badge-3">
          <rect width="64" height="64" rx="16" fill="#a78bfa" />
          <path d="M32 16 L36 28 L48 32 L36 36 L32 48 L28 36 L16 32 L28 28 Z" fill="#fff" />
          <text x="32" y="78" textAnchor="middle" fontSize="12" fontWeight="800" fill="#3a4a52">AI</text>
        </g></g>
        {/* Code / Web Dev */}
        <g transform="translate(219,205)"><g className="hi-badge hi-badge-4">
          <rect width="64" height="64" rx="16" fill="#eadf42" />
          <path d="M24 22 L14 32 L24 42 M40 22 L50 32 L40 42" stroke="#3a4a52" strokeWidth="3.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <text x="32" y="78" textAnchor="middle" fontSize="9" fontWeight="800" fill="#3a4a52">Web Dev</text>
        </g></g>
        {/* Roblox / Game Dev */}
        <g transform="translate(303,205)"><g className="hi-badge hi-badge-5">
          <rect width="64" height="64" rx="16" fill="#df6a52" />
          <rect x="18" y="18" width="28" height="28" rx="4" fill="none" stroke="#fff" strokeWidth="3" transform="rotate(12 32 32)" />
          <text x="32" y="78" textAnchor="middle" fontSize="9" fontWeight="800" fill="#3a4a52">Game Dev</text>
        </g></g>
        {/* ESP32 / Robotics */}
        <g transform="translate(387,205)"><g className="hi-badge hi-badge-6">
          <rect width="64" height="64" rx="16" fill="#3f978c" />
          <rect x="18" y="18" width="28" height="28" rx="6" fill="none" stroke="#fff" strokeWidth="3" />
          <path d="M14 26 h4 M14 38 h4 M46 26 h4 M46 38 h4" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
          <text x="32" y="78" textAnchor="middle" fontSize="9" fontWeight="800" fill="#3a4a52">Robotics</text>
        </g></g>
      </g>

      {/* Dotted link to the little bot */}
      <path className="hi-float hi-float-console" d="M480 150 Q520 145 545 170" stroke="#4caaa1" strokeWidth="2" strokeDasharray="4 6" fill="none" opacity=".6" />

      {/* --- The small companion robot/bot --- */}
      <g className="hi-float hi-float-bot">
        <circle cx="555" cy="185" r="34" fill="url(#hiGlow)" />
        <rect x="533" y="160" width="44" height="44" rx="14" fill="url(#hiBot)" stroke="#c3ccca" strokeWidth="1.5" />
        <circle className="hi-scan" cx="555" cy="182" r="10" fill="#4caaa1" />
        <rect x="521" y="176" width="10" height="5" rx="2.5" fill="#c3ccca" />
        <rect x="579" y="176" width="10" height="5" rx="2.5" fill="#c3ccca" />
        <rect x="548" y="204" width="14" height="10" rx="4" fill="#c3ccca" />
      </g>

      {/* --- Character A: reaching up to place a "+" card, floating with glowing soles --- */}
      <g className="hi-float hi-float-kidA">
        <ellipse cx="118" cy="300" rx="16" ry="6" fill="#4caaa1" opacity=".5" className="hi-blink-slow" />
        <rect x="103" y="232" width="30" height="58" rx="14" fill="url(#hiTeal)" />
        <rect x="103" y="284" width="13" height="30" rx="6" fill="url(#hiNavy)" />
        <rect x="120" y="284" width="13" height="30" rx="6" fill="url(#hiNavy)" />
        <ellipse cx="109" cy="315" rx="9" ry="5" fill="#e8654f" /><ellipse cx="126" cy="315" rx="9" ry="5" fill="#e8654f" />
        <circle cx="112" cy="234" r="7" fill="#3f978c" />
        <circle cx="124" cy="234" r="7" fill="#3f978c" />
        <circle cx="118" cy="212" r="20" fill="url(#hiSkin1)" />
        <ellipse cx="111" cy="204" rx="7" ry="5" fill="#fff" opacity=".4" />
        <path d="M97 205 Q118 182 139 205 Q139 194 118 190 Q97 194 97 205Z" fill="#2a2a2a" />
        <rect x="101" y="196" width="34" height="10" rx="5" fill="#e8654f" transform="rotate(-4 118 201)" />
        <circle cx="110" cy="211" r="2.3" fill="#2a2a2a" /><circle cx="124" cy="211" r="2.3" fill="#2a2a2a" />
        <path d="M108 221 Q117 226 126 221" stroke="#a1633e" strokeWidth="2" fill="none" strokeLinecap="round" />
        <rect className="hi-armA-L" x="86" y="228" width="13" height="42" rx="6.5" fill="url(#hiSkin1)" />
        <rect className="hi-armA-R" x="134" y="228" width="13" height="42" rx="6.5" fill="url(#hiSkin1)" />
        <circle cx="92" cy="272" r="7.5" fill="url(#hiSkin1)" /><circle cx="140" cy="272" r="7.5" fill="url(#hiSkin1)" />
      </g>
      <g className="hi-float hi-float-cardPlus">
        <rect x="148" y="176" width="46" height="36" rx="10" fill="#fff" stroke="#f1c7b8" strokeWidth="1.5" />
        <path d="M171 188 v12 M165 194 h12" stroke="#dd765c" strokeWidth="3" strokeLinecap="round" />
      </g>

      {/* --- Character B: standing, pointing at the screen --- */}
      <g className="hi-float hi-float-kidB">
        <rect x="192" y="248" width="32" height="62" rx="15" fill="url(#hiYellow)" />
        <rect x="193" y="304" width="14" height="32" rx="6" fill="url(#hiNavy)" />
        <rect x="211" y="304" width="14" height="32" rx="6" fill="url(#hiNavy)" />
        <ellipse cx="200" cy="338" rx="9.5" ry="5" fill="#3f978c" /><ellipse cx="218" cy="338" rx="9.5" ry="5" fill="#3f978c" />
        <circle cx="188" cy="256" r="7.5" fill="#e0af3e" />
        <circle cx="224" cy="256" r="7.5" fill="#e0af3e" />
        <circle cx="208" cy="226" r="21" fill="url(#hiSkin2)" />
        <ellipse cx="200" cy="217" rx="7" ry="5" fill="#fff" opacity=".3" />
        <path d="M186 220 Q208 194 230 220 Q232 208 208 204 Q184 208 186 220Z" fill="#1c1310" />
        <circle cx="200" cy="226" r="2.4" fill="#1c1310" /><circle cx="216" cy="226" r="2.4" fill="#1c1310" />
        <path d="M198 236 Q208 241 218 236" stroke="#7a4a2a" strokeWidth="2" fill="none" strokeLinecap="round" />
        <rect className="hi-armB" x="224" y="256" width="42" height="13" rx="6.5" fill="url(#hiSkin2)" />
        <circle cx="266" cy="262" r="7.5" fill="url(#hiSkin2)" />
        <rect x="182" y="256" width="13" height="36" rx="6.5" fill="url(#hiSkin2)" />
        <circle cx="188" cy="294" r="7.5" fill="url(#hiSkin2)" />
      </g>

      {/* --- Character C: kneeling, adjusting a small tablet --- */}
      <g className="hi-float hi-float-kidC">
        <rect x="440" y="268" width="28" height="44" rx="13" fill="url(#hiTeal)" />
        <rect x="440" y="308" width="13" height="14" rx="5" fill="url(#hiNavy)" />
        <rect x="458" y="308" width="18" height="10" rx="5" fill="url(#hiNavy)" />
        <circle cx="444" cy="272" r="6.5" fill="#3f978c" />
        <circle cx="454" cy="248" r="19" fill="url(#hiSkin1)" />
        <ellipse cx="447" cy="240" rx="6.5" ry="4.5" fill="#fff" opacity=".4" />
        <path d="M436 244 Q454 222 472 244 Q472 234 454 230 Q436 234 436 244Z" fill="#4a3222" />
        <circle cx="447" cy="249" r="6.5" fill="none" stroke="#2a2a2a" strokeWidth="1.6" />
        <circle cx="461" cy="249" r="6.5" fill="none" stroke="#2a2a2a" strokeWidth="1.6" />
        <path d="M453 249 h1.5" stroke="#2a2a2a" strokeWidth="1.6" />
        <circle cx="447" cy="249" r="2" fill="#2a2a2a" /><circle cx="461" cy="249" r="2" fill="#2a2a2a" />
        <path d="M446 259 Q454 263 462 259" stroke="#a1633e" strokeWidth="2" fill="none" strokeLinecap="round" />
        <rect className="hi-armC" x="466" y="272" width="34" height="12" rx="6" fill="url(#hiSkin1)" />
        <circle cx="500" cy="278" r="7" fill="url(#hiSkin1)" />
        <rect x="490" y="290" width="46" height="34" rx="6" fill="#fff" stroke="#c9d8e0" />
        <rect x="497" y="298" width="14" height="18" rx="2" fill="url(#hiCoral)" />
        <rect x="513" y="304" width="14" height="12" rx="2" fill="url(#hiYellow)" />
      </g>

      {/* --- Character D: sitting cross-legged, with a small dog --- */}
      <g className="hi-float hi-float-kidD">
        <path d="M328 300 Q345 330 385 300 L385 320 Q345 344 328 320 Z" fill="url(#hiNavy)" />
        <rect x="335" y="256" width="42" height="52" rx="18" fill="url(#hiMauve)" />
        <circle cx="356" cy="240" r="20" fill="url(#hiSkin1)" />
        <ellipse cx="349" cy="232" rx="6.5" ry="4.5" fill="#fff" opacity=".4" />
        <path d="M334 236 Q356 204 378 236 Q380 270 366 276 Q372 244 356 240 Q340 244 346 276 Q332 270 334 236Z" fill="#3a2a1f" />
        <circle cx="348" cy="239" r="2.3" fill="#2a2a2a" /><circle cx="362" cy="239" r="2.3" fill="#2a2a2a" />
        <path d="M346 249 Q355 254 364 249" stroke="#a1633e" strokeWidth="2" fill="none" strokeLinecap="round" />
        <rect className="hi-armD" x="374" y="268" width="34" height="12" rx="6" fill="url(#hiSkin1)" />
        <circle cx="408" cy="274" r="7" fill="url(#hiSkin1)" />
        <rect x="316" y="270" width="30" height="12" rx="6" fill="url(#hiSkin1)" />
        <circle cx="316" cy="276" r="7" fill="url(#hiSkin1)" />
      </g>
      <g className="hi-float hi-float-dog">
        <ellipse cx="300" cy="322" rx="20" ry="13" fill="#e0b98a" />
        <circle cx="282" cy="308" r="11" fill="#e0b98a" />
        <path d="M274 300 l-4 -10 l9 4Z" fill="#e0b98a" />
        <path d="M290 300 l4 -10 l-9 4Z" fill="#e0b98a" />
        <circle cx="278" cy="307" r="1.6" fill="#2a2a2a" />
      </g>
      <g className="hi-float hi-float-cardChart">
        <rect x="392" y="268" width="42" height="34" rx="9" fill="#fff" stroke="#e6d6e0" strokeWidth="1.5" />
        <rect x="399" y="288" width="6" height="9" rx="2" fill="#e0af3e" />
        <rect x="408" y="282" width="6" height="15" rx="2" fill="#df6a52" />
        <rect x="417" y="286" width="6" height="11" rx="2" fill="#3f978c" />
      </g>
    </svg>
  );
}

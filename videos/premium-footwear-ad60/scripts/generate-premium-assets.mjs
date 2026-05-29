import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const productDir = path.join(root, "public", "assets", "products");
const textureDir = path.join(root, "public", "assets", "textures");
const logoDir = path.join(root, "public", "assets", "logos");

await fs.mkdir(productDir, { recursive: true });
await fs.mkdir(textureDir, { recursive: true });
await fs.mkdir(logoDir, { recursive: true });

const svg = (body, defs = "") => `
<svg xmlns="http://www.w3.org/2000/svg" width="1800" height="1350" viewBox="0 0 1800 1350">
  <defs>
    <filter id="grain" x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="4" seed="24" result="noise"/>
      <feColorMatrix in="noise" type="saturate" values="0"/>
      <feComponentTransfer>
        <feFuncA type="table" tableValues="0 0.11"/>
      </feComponentTransfer>
      <feBlend in="SourceGraphic" mode="overlay"/>
    </filter>
    <filter id="shadow" x="-25%" y="-25%" width="150%" height="150%">
      <feDropShadow dx="0" dy="54" stdDeviation="36" flood-color="#000000" flood-opacity="0.55"/>
    </filter>
    <linearGradient id="metal" x1="340" x2="1430" y1="500" y2="870" gradientUnits="userSpaceOnUse">
      <stop stop-color="#f6efe2"/>
      <stop offset="0.26" stop-color="#c9c2b4"/>
      <stop offset="0.55" stop-color="#35393a"/>
      <stop offset="0.76" stop-color="#e4d7bc"/>
      <stop offset="1" stop-color="#111416"/>
    </linearGradient>
    <linearGradient id="warmLeather" x1="390" x2="1400" y1="360" y2="890" gradientUnits="userSpaceOnUse">
      <stop stop-color="#8e5432"/>
      <stop offset="0.24" stop-color="#2b1710"/>
      <stop offset="0.56" stop-color="#a96c3c"/>
      <stop offset="0.82" stop-color="#170d09"/>
      <stop offset="1" stop-color="#050404"/>
    </linearGradient>
    <linearGradient id="canvas" x1="340" x2="1360" y1="420" y2="900" gradientUnits="userSpaceOnUse">
      <stop stop-color="#fbf4e6"/>
      <stop offset="0.45" stop-color="#c7c0ad"/>
      <stop offset="0.72" stop-color="#253f36"/>
      <stop offset="1" stop-color="#07100d"/>
    </linearGradient>
    <linearGradient id="bootLeather" x1="480" x2="1180" y1="160" y2="1040" gradientUnits="userSpaceOnUse">
      <stop stop-color="#a8693d"/>
      <stop offset="0.28" stop-color="#3a2116"/>
      <stop offset="0.58" stop-color="#120b08"/>
      <stop offset="1" stop-color="#050403"/>
    </linearGradient>
    <radialGradient id="studio" cx="50%" cy="50%" r="54%">
      <stop stop-color="#f8ebcd" stop-opacity="0.22"/>
      <stop offset="0.42" stop-color="#b89145" stop-opacity="0.08"/>
      <stop offset="1" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
    ${defs}
  </defs>
  <rect width="1800" height="1350" fill="none"/>
  <ellipse cx="920" cy="1048" rx="590" ry="94" fill="#000" opacity=".34" filter="url(#shadow)"/>
  <g filter="url(#grain)">
    ${body}
  </g>
</svg>`;

const productSvgs = {
  "urban-01.png": svg(`
    <g filter="url(#shadow)">
      <path d="M262 760c176-17 270-79 384-226 89-115 232-176 372-151 96 17 160 74 245 147 104 89 194 115 337 122 111 6 158 65 111 137-75 115-280 157-585 159-386 4-626 4-855-43-93-19-99-134-9-145Z" fill="url(#metal)"/>
      <path d="M358 780c386 93 820 95 1235 19 52-10 93 41 65 88-38 65-137 111-266 120-415 31-872 19-1165-64-103-29-95-191 131-163Z" fill="#f1eadc"/>
      <path d="M410 804c278 68 650 85 1020 39" stroke="#0e4a56" stroke-width="22" stroke-linecap="round" fill="none" opacity=".7"/>
      <path d="M685 494c-66 93-132 176-230 232" stroke="#272b2d" stroke-width="18" stroke-linecap="round" fill="none" opacity=".5"/>
      <path d="M785 476c112 42 202 91 277 157" stroke="#fff9ec" stroke-width="15" stroke-linecap="round" fill="none" opacity=".68"/>
      <path d="M780 575h220M746 642h300M711 708h392" stroke="#111315" stroke-width="23" stroke-linecap="round"/>
      <path d="M1260 658c80 27 169 39 287 32" stroke="#d8be7b" stroke-width="20" stroke-linecap="round" fill="none"/>
      <path d="M395 880c365 63 782 69 1133 8" stroke="#0b0c0d" stroke-width="24" opacity=".4"/>
    </g>`),
  "urban-02.png": svg(`
    <g filter="url(#shadow)">
      <path d="M300 742c120-6 214-49 300-145 91-101 206-154 347-135 113 15 188 73 292 127 84 44 172 60 309 66 94 4 136 56 96 119-65 102-274 134-620 124-288-8-494-12-690-55-89-19-109-96-34-101Z" fill="#101316"/>
      <path d="M528 570c197 74 477 78 712 20" stroke="#eee8da" stroke-width="96" stroke-linecap="round" opacity=".9"/>
      <path d="M365 772c340 87 757 91 1150 24 54-9 88 51 47 94-55 58-182 92-368 100-326 15-661 0-903-62-102-27-89-190 74-156Z" fill="#121416"/>
      <path d="M578 609c150 54 326 68 531 38" stroke="#d8be7b" stroke-width="18" stroke-linecap="round" opacity=".72"/>
      <path d="M746 576h326M712 635h420M675 697h514" stroke="#050606" stroke-width="22" stroke-linecap="round"/>
      <path d="M430 815c302 57 685 65 1056 17" stroke="#f6efe2" stroke-width="14" stroke-linecap="round" opacity=".45"/>
    </g>`),
  "formal-01.png": svg(`
    <g filter="url(#shadow)">
      <path d="M272 760c186 13 285-54 393-198 96-127 222-194 383-171 109 16 179 80 270 153 80 65 170 92 291 99 109 6 163 62 121 136-53 94-227 153-534 163-329 11-676 18-905-46-84-24-115-144-19-136Z" fill="url(#warmLeather)"/>
      <path d="M360 807c382 78 891 84 1295-14 57-14 101 45 66 91-55 73-172 106-331 119-383 31-822 11-1101-54-99-23-112-157 71-142Z" fill="#100b09"/>
      <path d="M660 515c171 34 380 31 579-6" stroke="#d8be7b" stroke-width="16" stroke-linecap="round" opacity=".7"/>
      <path d="M746 444c89 76 165 134 256 168" stroke="#130a07" stroke-width="22" stroke-linecap="round" opacity=".75"/>
      <path d="M475 718c300 61 672 58 1021-11" stroke="#f6efe2" stroke-width="10" opacity=".28"/>
      <path d="M710 428c160-43 343-22 497 58" stroke="#f6efe2" stroke-width="70" stroke-linecap="round" opacity=".16"/>
    </g>`),
  "formal-02.png": svg(`
    <g filter="url(#shadow)">
      <path d="M300 775c160 6 262-48 372-158 105-106 248-153 416-112 106 26 173 91 258 131 73 34 154 47 258 50 99 3 140 58 91 130-69 101-263 142-578 143-306 2-605-7-822-59-104-25-104-129 5-125Z" fill="#111010"/>
      <path d="M450 725c320 60 674 52 1010-23" stroke="#7d4b2e" stroke-width="150" stroke-linecap="round" opacity=".92"/>
      <path d="M370 828c366 66 760 65 1192 1" stroke="#0b0908" stroke-width="94" stroke-linecap="round"/>
      <path d="M650 596c195 44 398 35 594-24" stroke="#f6efe2" stroke-width="12" opacity=".36"/>
      <path d="M748 520h358M710 579h472" stroke="#0b0807" stroke-width="19" stroke-linecap="round"/>
    </g>`),
  "casual-01.png": svg(`
    <g filter="url(#shadow)">
      <path d="M295 767c152-8 247-48 372-173 91-91 226-141 366-120 137 21 212 100 312 153 77 41 157 55 263 60 103 5 151 61 110 133-59 104-269 142-584 138-362-5-602 3-830-49-91-20-107-136-9-142Z" fill="url(#canvas)"/>
      <path d="M380 799c400 90 823 87 1257 8 57-10 100 50 61 96-55 66-191 101-401 111-353 17-734 2-1007-64-100-24-108-187 90-151Z" fill="#efe7d8"/>
      <path d="M448 824c339 69 741 73 1120 13" stroke="#0c332a" stroke-width="18" stroke-linecap="round" opacity=".6"/>
      <path d="M692 586c161 48 344 55 547 20" stroke="#0c332a" stroke-width="28" stroke-linecap="round" opacity=".5"/>
      <path d="M650 667c188 34 383 39 596 8" stroke="#ffffff" stroke-width="14" stroke-linecap="round" opacity=".64"/>
      <path d="M500 690h940M610 625h680M455 755h1100" stroke="#c6bfaf" stroke-width="7" opacity=".45"/>
    </g>`),
  "casual-02.png": svg(`
    <g filter="url(#shadow)">
      <path d="M290 774c158-12 253-57 370-166 100-93 235-132 388-97 131 30 206 96 301 144 82 42 164 57 276 63 100 5 143 61 97 131-66 101-270 135-593 128-342-8-579-2-819-56-97-22-110-138-20-147Z" fill="#d9d0bd"/>
      <path d="M430 593c165 70 383 86 626 51" stroke="#102921" stroke-width="135" stroke-linecap="round" opacity=".85"/>
      <path d="M386 814c392 80 800 77 1192 17" stroke="#f2eadb" stroke-width="89" stroke-linecap="round"/>
      <path d="M560 730c320 62 612 62 900 9" stroke="#0c332a" stroke-width="14" stroke-linecap="round" opacity=".55"/>
    </g>`),
  "boots-01.png": svg(`
    <g filter="url(#shadow)">
      <path d="M640 160h415c52 0 96 38 104 90l61 432c88 34 186 51 316 56 116 5 171 69 124 146-57 96-233 142-507 145-330 4-632-15-834-75-105-31-110-167 19-183 92-11 152-41 191-95 45-63 47-171 45-300l-3-157c-1-35 28-59 69-59Z" fill="url(#bootLeather)"/>
      <path d="M405 800c369 92 777 102 1184 20 76-16 132 56 83 119-56 74-210 112-447 121-340 12-689-11-940-80-99-28-83-230 120-180Z" fill="#0b0908"/>
      <path d="M688 235c74 81 237 89 378 21" stroke="#d8be7b" stroke-width="15" stroke-linecap="round" fill="none" opacity=".56"/>
      <path d="M660 352h493M670 449h508M688 548h500" stroke="#120b08" stroke-width="23" stroke-linecap="round" opacity=".72"/>
      <path d="M790 305c45 171 45 328 6 471M930 308c52 173 54 334 14 483" stroke="#d8be7b" stroke-width="15" stroke-linecap="round" opacity=".5"/>
      <path d="M492 847c303 58 703 67 1064 3" stroke="#c99d58" stroke-width="20" stroke-linecap="round" opacity=".58"/>
    </g>`),
  "boots-02.png": svg(`
    <g filter="url(#shadow)">
      <path d="M670 195h325c72 0 125 58 118 129l-35 370c117 45 238 69 397 72 115 2 160 65 107 141-70 99-252 138-559 136-296-2-550-19-720-75-109-35-90-164 39-179 108-12 174-52 205-121 30-67 20-166 19-283l-1-90c-1-58 47-100 105-100Z" fill="#17110d"/>
      <path d="M703 252c68 53 171 71 301 32" stroke="#a8693d" stroke-width="112" stroke-linecap="round" opacity=".88"/>
      <path d="M456 827c335 81 704 88 1112 23" stroke="#080605" stroke-width="115" stroke-linecap="round"/>
      <path d="M664 384h380M653 475h395M639 565h414" stroke="#080504" stroke-width="22" stroke-linecap="round"/>
      <path d="M760 330c25 151 21 310-13 480M895 325c30 162 28 329-9 500" stroke="#d8be7b" stroke-width="15" stroke-linecap="round" opacity=".55"/>
      <path d="M535 865c292 43 640 47 995 4" stroke="#c99d58" stroke-width="16" stroke-linecap="round" opacity=".5"/>
    </g>`),
};

for (const [file, markup] of Object.entries(productSvgs)) {
  await sharp(Buffer.from(markup)).png({ compressionLevel: 9 }).toFile(path.join(productDir, file));
}

const textureSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="2160" height="3840" viewBox="0 0 2160 3840">
  <defs>
    <filter id="noise">
      <feTurbulence type="fractalNoise" baseFrequency="0.63" numOctaves="5" seed="77"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer>
        <feFuncA type="table" tableValues="0 .18"/>
      </feComponentTransfer>
    </filter>
  </defs>
  <rect width="2160" height="3840" fill="#020203"/>
  <rect width="2160" height="3840" filter="url(#noise)" opacity=".55"/>
  <path d="M-160 2840C450 2500 1010 2480 2310 2720" fill="none" stroke="#f6efe2" stroke-opacity=".05" stroke-width="5"/>
  <path d="M-180 1120C580 970 1120 1100 2340 840" fill="none" stroke="#d8be7b" stroke-opacity=".045" stroke-width="4"/>
</svg>`;
await sharp(Buffer.from(textureSvg)).png({ compressionLevel: 9 }).toFile(path.join(textureDir, "cinematic-grain.png"));

const logo = `
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="900" viewBox="0 0 900 900">
  <rect width="900" height="900" rx="164" fill="#020203"/>
  <text x="450" y="410" text-anchor="middle" font-family="Arial, sans-serif" font-size="170" font-weight="800" fill="#F6EFE2" letter-spacing="12">ÉTER</text>
  <path d="M230 502h440" stroke="#D8BE7B" stroke-width="12" stroke-linecap="round"/>
  <text x="450" y="600" text-anchor="middle" font-family="Consolas, monospace" font-size="42" fill="#D8BE7B" letter-spacing="10">FOOTWEAR</text>
</svg>`;
await sharp(Buffer.from(logo)).png({ compressionLevel: 9 }).toFile(path.join(logoDir, "eter-logo-premium.png"));

console.log("Generated premium raster product, texture and logo assets.");

import type { ArtIcon } from "@/lib/types";
import { paletteFromColors, placeholderPalette, placeholderTone, type PlaceholderTone } from "@/lib/theme";
import { cn } from "@/lib/utils";

export const ART_LABELS: Record<ArtIcon, string> = {
  tshirt: "T-shirt",
  polo: "Polo shirt",
  shirt: "Shirt",
  hoodie: "Hoodie",
  panjabi: "Panjabi",
  kurti: "Kurti",
  saree: "Saree",
  dress: "Dress",
  hijab: "Hijab",
  pants: "Trousers",
  shorts: "Shorts",
  joggers: "Joggers",
  jacket: "Jacket",
  socks: "Socks",
  innerwear: "Innerwear",
  sneaker: "Sneaker",
  sandal: "Sandal",
  slipper: "Slipper",
  formal: "Formal shoe",
  heel: "Heeled sandal",
  kids: "Kids wear",
  onesie: "Onesie",
  nightwear: "Nightwear",
  jute: "Jute bag",
  backpack: "Backpack",
  tote: "Tote bag",
  wallet: "Wallet",
  duffel: "Duffel bag",
  cap: "Cap",
  watch: "Watch",
  belt: "Belt",
  sunglasses: "Sunglasses",
  jewelry: "Jewellery",
  perfume: "Attar bottle",
  muffler: "Muffler",
};

function ArtGlyph({ art }: { art: ArtIcon }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.1,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (art) {
    case "tshirt":
      return (
        <g {...common}>
          <path d="M69 62 46 73 30 115l26 12 11-19v100c0 5 3 8 8 8h50c5 0 8-3 8-8V108l11 19 26-12-16-42-23-11c-5 11-16 17-31 17s-26-6-31-17Z" />
          <path d="M69 62c5 12 16 18 31 18s26-6 31-18" opacity=".55" />
          <path d="M66 199h68" opacity=".4" />
          <path d="M74 82 66 90M126 82l8 8" opacity=".35" />
        </g>
      );
    case "polo":
      return (
        <g {...common}>
          <path d="M69 62 46 73 30 115l26 12 11-19v100c0 5 3 8 8 8h50c5 0 8-3 8-8V108l11 19 26-12-16-42-23-11c-5 11-16 17-31 17s-26-6-31-17Z" />
          <path d="M69 62l18 17 13 10 13-10 18-17" />
          <path d="M100 89v35" opacity=".7" />
          <circle cx="100" cy="105" r="2.2" fill="currentColor" stroke="none" />
          <circle cx="100" cy="116" r="2.2" fill="currentColor" stroke="none" />
          <path d="M66 199h68" opacity=".35" />
        </g>
      );
    case "shirt":
      return (
        <g {...common}>
          <path d="M66 66 34 82v48l25 6 7-16v86c0 4 3 7 7 7h54c4 0 7-3 7-7v-86l7 16 25-6V82L134 66l-20-8c-4 9-9 14-14 14s-10-5-14-14l-20 8Z" />
          <path d="M86 58l14 18 14-18" />
          <path d="M100 76v130" opacity=".35" />
          <circle cx="100" cy="93" r="2" fill="currentColor" stroke="none" />
          <circle cx="100" cy="117" r="2" fill="currentColor" stroke="none" />
          <circle cx="100" cy="141" r="2" fill="currentColor" stroke="none" />
          <circle cx="100" cy="165" r="2" fill="currentColor" stroke="none" />
          <path d="M58 122h17M125 122h17" opacity=".35" />
        </g>
      );
    case "hoodie":
      return (
        <g {...common}>
          <path d="M68 66 44 78 30 120l27 11 11-17v94c0 5 3 8 8 8h48c5 0 8-3 8-8v-94l11 17 27-11-14-42-24-12" />
          <path d="M68 66c-2-19 10-33 32-33s34 14 32 33c-9 7-19 10-32 10s-23-3-32-10Z" />
          <path d="M68 66c8 9 19 13 32 13s24-4 32-13" opacity=".55" />
          <path d="M88 70v32M112 70v32" opacity=".6" />
          <path d="M74 152h52v30H74z" opacity=".5" />
          <path d="M66 199h68" opacity=".25" />
        </g>
      );
    case "panjabi":
      return (
        <g {...common}>
          <path d="M69 60 44 72 32 112l26 10 9-16v120c0 5 3 8 8 8h50c5 0 8-3 8-8V106l9 16 26-10-12-40-25-12c-5 10-16 16-31 16s-26-6-31-16Z" />
          <path d="M83 52h34v14H83z" />
          <path d="M87 52c0 8 6 13 13 13s13-5 13-13" opacity=".5" />
          <path d="M100 72v144" opacity=".45" />
          <circle cx="100" cy="88" r="2.1" fill="currentColor" stroke="none" />
          <circle cx="100" cy="106" r="2.1" fill="currentColor" stroke="none" />
          <circle cx="100" cy="124" r="2.1" fill="currentColor" stroke="none" />
          <path d="M68 194h64v6H68zM68 206h64v6H68z" opacity=".35" />
        </g>
      );
    case "kurti":
      return (
        <g {...common}>
          <path d="M70 60 48 71 34 111l25 11 10-17-4 34 12 74c1 6 5 9 11 9h44c6 0 10-3 11-9l12-74-4-34 10 17 25-11-14-40-22-11c-5 10-15 16-30 16s-25-6-30-16Z" />
          <path d="M70 60c5 12 15 18 30 18s25-6 30-18" opacity=".55" />
          <path d="M78 180c14 5 30 5 44 0" opacity=".45" />
          <path d="M55 202c2 12-3 20-7 26M145 202c-2 12 3 20 7 26" opacity=".35" />
          <path d="M84 74c-2 10-6 16-12 20M116 74c2 10 6 16 12 20" opacity=".3" />
        </g>
      );
    case "saree":
      return (
        <g {...common}>
          {/* hanger */}
          <path d="M100 66V50" />
          <path d="M100 50c-9 0-15-6-15-14 0-7 6-13 14-13 7 0 13 5 13 12 0 5-2 9-6 12" />
          <path d="M100 66 56 96M100 66l44 30M56 96h88" />
          {/* saree drape */}
          <path d="M61 97c-3 30-8 60-13 89-2 13 4 21 16 21h72c12 0 18-8 16-21-5-29-10-59-13-89" />
          <path d="M83 98c-4 32-8 63-11 94M100 98v101M123 98c4 32 8 63 11 94" opacity=".22" />
          {/* pallu falling across the drape */}
          <path d="M136 98c11 20 12 43 7 64-4 18-13 33-26 46" />
          <path d="M128 104c9 19 9 39 4 58-4 16-11 29-22 40" opacity=".4" />
          {/* zari border */}
          <path d="M64 202c22 9 50 9 72 0M66 210c20 8 46 8 66 0" opacity=".55" />
          <path d="M70 220v8M80 223v8M90 224v8M100 225v8M110 224v8M120 223v8M130 220v8" opacity=".45" />
          {/* buti motifs */}
          <g opacity=".55">
            <path d="M82 132l3 7 7 1-5 5 2 7-7-4-7 4 2-7-5-5 7-1Z" />
            <path d="M105 160l2 5 5 1-4 4 1 5-4-3-5 3 1-5-3-4 5-1Z" />
            <path d="M78 180l2 5 5 1-4 4 1 5-4-3-5 3 1-5-3-4 5-1Z" />
          </g>
          <path d="M144 176c7 0 12-3 15-8" opacity=".35" />
        </g>
      );
    case "dress":
      return (
        <g {...common}>
          <path d="M72 58 52 68 42 104l22 9 8-14-2 30 16 88c1 6 6 9 14 9s13-3 14-9l16-88-2-30 8 14 22-9-10-36-20-10c-5 10-14 16-28 16s-23-6-28-16Z" />
          <path d="M72 58c5 11 14 17 28 17s23-6 28-17" opacity=".5" />
          <path d="M74 138h52" opacity=".5" />
          <path d="M86 76c-1 8-4 13-9 17M114 76c1 8 4 13 9 17" opacity=".3" />
          <path d="M70 212c20 5 40 5 60 0" opacity=".35" />
        </g>
      );
    case "hijab":
      return (
        <g {...common}>
          {/* a long silk scarf, draped once over itself */}
          <path d="M52 64c30 22 62 28 96 20l-8 32c-32 8-60 2-86-18Z" />
          <path d="M56 102c26 20 56 26 86 20l-14 66c-28 8-52 2-70-14Z" />
          <path d="M64 82c18 12 38 18 58 17" opacity=".35" />
          <path d="M66 178c16 8 34 10 52 5" opacity=".35" />
          <path d="M100 132l4 8 9 1-7 6 2 9-8-4-8 4 2-9-7-6 9-1Z" opacity=".45" />
          <path d="M72 190l-2 14M84 192l-1 14M96 194v14M108 194v14M120 192l1 14" opacity=".3" />
          <path d="M140 88c5 0 9-2 12-5" opacity=".3" />
        </g>
      );
    case "pants":
      return (
        <g {...common}>
          <path d="M66 48h68v30l-7 154H105l-5-112-5 112H73L66 78Z" />
          <path d="M66 62h68M90 62v22M110 62v22" opacity=".45" />
          <path d="M100 78v30" opacity=".4" />
          <path d="M72 200h22M106 200h22" opacity=".3" />
        </g>
      );
    case "shorts":
      return (
        <g {...common}>
          <path d="M66 66h68v22l-8 66h-26l-2-54-2 54H74l-8-66Z" />
          <path d="M66 80h68M90 80v20M110 80v20" opacity=".45" />
          <path d="M74 132h20M106 132h20" opacity=".3" />
          <path d="M100 80v28" opacity=".3" />
        </g>
      );
    case "joggers":
      return (
        <g {...common}>
          <path d="M68 48h64v28l-8 148h-19l-5-104-5 104H77L68 76Z" />
          <path d="M68 62h64M84 62v18M116 62v18" opacity=".45" />
          <path d="M88 62c0 8 5 13 12 13s12-5 12-13" opacity=".35" />
          <path d="M76 204h18M106 204h18" opacity=".5" />
          <path d="M88 78c-2 10-1 18 3 25M112 78c2 10 1 18-3 25" opacity=".3" />
        </g>
      );
    case "jacket":
      return (
        <g {...common}>
          <path d="M70 62 42 76 32 122l24 10 10-17v88c0 5 3 8 8 8h52c5 0 8-3 8-8v-88l10 17 24-10-10-46-28-14" />
          <path d="M70 62l20 18-8 20 8 20-8 20 8 20-8 20 8 20-8 18M130 62l-20 18 8 20-8 20 8 20-8 20 8 20-8 20 8 18" opacity=".7" />
          <path d="M100 84v120" opacity=".45" />
          <path d="M70 142l-14 10M130 142l14 10" opacity=".35" />
          <path d="M58 118v22M142 118v22" opacity=".35" />
        </g>
      );
    case "socks":
      return (
        <g {...common}>
          <path d="M66 56h30v88c0 16 10 24 26 30 20 8 26 18 22 30-4 13-18 18-34 12-18-7-32-20-38-38-3-10-5-22-5-38Z" />
          <path d="M66 72h30M70 182c10 12 22 20 38 24" opacity=".4" />
          <path d="M104 56h30v88c0 16 10 24 26 30 20 8 26 18 22 30-4 13-18 18-34 12-18-7-32-20-38-38-3-10-5-22-5-38Z" opacity=".45" />
        </g>
      );
    case "innerwear":
      return (
        <g {...common}>
          <path d="M74 60 52 72l-8 36 30 6 4-14v96c0 5 3 8 8 8h28c5 0 8-3 8-8v-96l4 14 30-6-8-36-22-12c-7 14-16 20-26 20s-19-6-26-20Z" />
          <path d="M74 60c7 16 16 24 26 24s19-8 26-24" opacity=".5" />
          <path d="M100 92v118" opacity=".18" />
        </g>
      );
    case "sneaker":
      return (
        <g {...common}>
          <path d="M35 172c0-14 9-22 22-27l27-9 22 19 26 7c19 5 31 14 34 28 2 11-5 19-17 19H50c-10 0-15-6-15-16Z" />
          <path d="M84 136l12 22M98 132l12 22M112 140l10 18" opacity=".65" />
          <path d="M79 148c20 12 44 18 68 18" opacity=".35" />
          <path d="M35 194h139" />
          <path d="M42 204h124" opacity=".4" />
          <path d="M120 136c8 3 14 6 18 11" opacity=".3" />
        </g>
      );
    case "sandal":
      return (
        <g {...common}>
          <path d="M36 174c0-9 6-15 16-18l30-10c17-6 30-6 44 0l30 10c10 3 16 9 16 18 0 8-6 13-16 13H52c-10 0-16-5-16-13Z" />
          <path d="M52 158c16 9 34 13 54 12 18 0 35-4 48-12" opacity=".5" />
          <path d="M68 148c8-22 24-34 48-34s40 12 48 34" opacity=".55" />
          <path d="M42 194h124" opacity=".35" />
          <path d="M76 148c10-10 22-15 37-15" opacity=".3" />
        </g>
      );
    case "slipper":
      return (
        <g {...common}>
          <path d="M48 172c0-12 8-19 21-23l31-8c16-4 30-3 42 3l26 13c12 6 16 14 12 24-4 11-15 15-30 15H64c-11 0-16-7-16-24Z" />
          <path d="M86 146c22-10 48-8 70 6" opacity=".55" />
          <path d="M74 152c30-18 66-18 98 0" opacity=".35" />
          <path d="M56 192h120" opacity=".3" />
        </g>
      );
    case "formal":
      return (
        <g {...common}>
          <path d="M34 172c0-12 8-19 22-24l34-10 34 14 40 12c14 4 22 12 22 22 0 8-6 12-16 12H50c-11 0-16-5-16-14Z" />
          <path d="M88 142l10 20M102 138l10 20M116 144l9 17" opacity=".6" />
          <path d="M34 188h136" />
          <path d="M150 184l18 16" opacity=".5" />
          <path d="M46 198h112" opacity=".3" />
        </g>
      );
    case "heel":
      return (
        <g {...common}>
          <path d="M46 172c0-9 6-15 16-17l38-10 26 10 22 4-18 30c-6 10-16 15-30 15H60c-9 0-14-6-14-14Z" />
          <path d="M76 148c18 10 37 13 58 10" opacity=".5" />
          <path d="M132 176l8 36h14" />
          <path d="M46 196h68" opacity=".3" />
          <path d="M58 148c8-16 22-26 44-30" opacity=".35" />
        </g>
      );
    case "kids":
      return (
        <g {...common}>
          <path d="M74 80 54 90l-12 34 22 8 8-14v70c0 5 3 8 8 8h40c5 0 8-3 8-8v-70l8 14 22-8-12-34-20-10c-4 9-13 14-26 14s-22-5-26-14Z" />
          <path d="M74 80c4 10 13 15 26 15s22-5 26-15" opacity=".45" />
          <path d="M100 132l4 9 10 1-7 7 2 10-9-5-9 5 2-10-7-7 10-1Z" opacity=".6" />
        </g>
      );
    case "onesie":
      return (
        <g {...common}>
          <path d="M74 62 54 74l-6 32 22 6 6-12v44l-14 24 8 12 14-16h12v22l12 10 12-10v-22h12l14 16 8-12-14-24v-44l6 12 22-6-6-32-20-12c-5 10-13 15-24 15s-19-5-24-15Z" />
          <path d="M74 62c5 10 13 15 24 15s19-5 24-15" opacity=".45" />
          <path d="M82 190h12M100 198h12" opacity=".5" />
          <circle cx="100" cy="105" r="2" fill="currentColor" stroke="none" />
        </g>
      );
    case "nightwear":
      return (
        <g {...common}>
          <path d="M68 94 48 106l-8 36 22 6 6-12v86c0 4 3 7 8 7h48c5 0 8-3 8-7v-86l6 12 22-6-8-36-20-12c-5 10-13 15-24 15s-19-5-24-15Z" />
          <path d="M68 94c5 10 13 15 24 15s19-5 24-15" opacity=".45" />
          <path d="M78 84c6-18 6-30-2-42" opacity=".35" />
          <path d="M116 52c-9 1-16 7-17 16 8 2 16-1 19-8 5 6 13 8 20 5 0-9-8-15-17-15 0 4-1 8-5 10-4-2-5-5-5-8Z" opacity=".5" />
          <g opacity=".5">
            <path d="M82 156l3 6 6 1-4 5 1 6-6-3-6 3 1-6-4-5 6-1Z" />
            <path d="M118 178l2 4 5 1-4 4 1 5-4-2-5 2 1-5-3-4 5-1Z" />
          </g>
        </g>
      );
    case "jute":
      return (
        <g {...common}>
          <path d="M52 100h96l-8 108c-1 8-6 12-14 12H74c-8 0-13-4-14-12Z" />
          <path d="M76 100V78c0-18 10-28 24-28s24 10 24 28v22" opacity=".7" />
          <path d="M66 100v108M86 100v108M106 100v108M126 100v108M134 100v108" opacity=".22" />
          <path d="M52 124h96M52 172h96" opacity=".25" />
          <path d="M70 144h60" opacity=".3" />
        </g>
      );
    case "backpack":
      return (
        <g {...common}>
          <path d="M66 78c0-14 14-24 34-24s34 10 34 24v122c0 8-5 12-13 12H79c-8 0-13-4-13-12Z" />
          <path d="M80 58c-5-13 3-22 20-22s25 9 20 22" opacity=".7" />
          <path d="M66 122h68M66 164h68" opacity=".5" />
          <path d="M84 122v42h32v-42" opacity=".55" />
          <path d="M66 96c-12 4-18 12-18 26v56M134 96c12 4 18 12 18 26v56" opacity=".35" />
          <path d="M100 142v8" opacity=".6" />
          <path d="M76 78h48" opacity=".35" />
        </g>
      );
    case "tote":
      return (
        <g {...common}>
          <path d="M58 94h84l-6 106c-1 8-6 12-14 12H78c-8 0-13-4-14-12Z" />
          <path d="M78 94V80c0-15 9-24 22-24s22 9 22 24v14" opacity=".65" />
          <path d="M62 122h76" opacity=".35" />
          <path d="M74 150h52v34H74z" opacity=".25" />
          <path d="M58 200c28 5 56 5 84 0" opacity=".3" />
        </g>
      );
    case "wallet":
      return (
        <g {...common}>
          <path d="M42 92h116c5 0 8 3 8 8v72c0 5-3 8-8 8H52c-6 0-10-4-10-10Z" />
          <path d="M42 114h124" opacity=".45" />
          <path d="M112 132h46v26h-46c-7 0-12-5-12-13s5-13 12-13Z" />
          <path d="M64 82c18-8 38-11 60-10 12 0 20 4 22 12" opacity=".45" />
          <circle cx="120" cy="145" r="2.5" fill="currentColor" stroke="none" />
          <path d="M52 196h104" opacity=".3" />
        </g>
      );
    case "duffel":
      return (
        <g {...common}>
          <path d="M38 122c0-12 8-18 20-18h84c12 0 20 6 20 18v58c0 12-8 18-20 18H58c-12 0-20-6-20-18Z" />
          <path d="M60 104c0-22 12-36 30-36h20c18 0 30 14 30 36" opacity=".6" />
          <path d="M38 132h124" opacity=".35" />
          <path d="M64 112h72v20H64z" opacity=".35" />
          <path d="M52 160h96" opacity=".3" />
          <path d="M82 104v-16M118 104v-16" opacity=".4" />
          <circle cx="136" cy="96" r="5" opacity=".5" />
        </g>
      );
    case "cap":
      return (
        <g {...common}>
          <path d="M48 138c0-38 23-64 52-64s52 26 52 64c0 8-4 12-12 12H60c-8 0-12-4-12-12Z" />
          <path d="M48 138c30 10 74 10 104 0" opacity=".5" />
          <path d="M100 74v64M100 74c-15 4-24 22-24 64M100 74c15 4 24 22 24 64" opacity=".3" />
          <path d="M148 138l28 14c6 3 5 12-3 14l-38 6" />
          <path d="M60 138c-8 10-10 22-8 30" opacity=".35" />
          <circle cx="100" cy="78" r="3" fill="currentColor" stroke="none" />
        </g>
      );
    case "watch":
      return (
        <g {...common}>
          <circle cx="100" cy="126" r="46" />
          <circle cx="100" cy="126" r="37" opacity=".4" />
          <path d="M80 84V50c0-5 4-9 9-9h22c5 0 9 4 9 9v34M80 168v34c0 5 4 9 9 9h22c5 0 9-4 9-9v-34" />
          <path d="M100 50v-8M100 194v8" opacity=".5" />
          <path d="M100 126V100M100 126l18 12" />
          <circle cx="100" cy="126" r="3" fill="currentColor" stroke="none" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <path
              key={deg}
              d="M100 94v6"
              transform={`rotate(${deg} 100 126)`}
              opacity=".45"
            />
          ))}
          <path d="M140 118l9-3" opacity=".5" />
        </g>
      );
    case "belt":
      return (
        <g {...common}>
          <path d="M42 120c18-18 44-24 72-18 22 5 40 18 46 38" opacity=".55" />
          <path d="M42 142c20-20 48-26 76-20 22 5 38 18 42 38" />
          <rect x="36" y="112" width="28" height="44" rx="5" />
          <path d="M50 112v44" opacity=".5" />
          <path d="M80 150c-3 8-2 14 3 18M104 154c-3 8-2 14 3 18M128 154c-3 7-2 13 3 16" opacity=".35" />
        </g>
      );
    case "sunglasses":
      return (
        <g {...common}>
          <path d="M32 108c18-10 38-12 54-4l8 6c4 3 8 3 12 0l8-6c16-8 36-6 54 4" />
          <path d="M32 108c-4 30 6 48 30 50 20 2 30-12 32-32l1-10c-20-8-42-12-63-8Z" />
          <path d="M168 108c4 30-6 48-30 50-20 2-30-12-32-32l-1-10c20-8 42-12 63-8Z" />
          <path d="M94 122c4-3 8-3 12 0" opacity=".6" />
          <path d="M32 108l-8 8M168 108l8 8" opacity=".4" />
          <path d="M52 128c8 10 18 14 30 12" opacity=".35" />
        </g>
      );
    case "jewelry":
      return (
        <g {...common}>
          <path d="M50 58c2 34 14 62 36 82 6 6 8 8 14 8s8-2 14-8c22-20 34-48 36-82" />
          <path d="M56 58h88" opacity=".4" />
          <path d="M100 148l16 14-16 40-16-40Z" />
          <path d="M100 156l9 8-9 22-9-22Z" opacity=".4" />
          <circle cx="100" cy="60" r="3" fill="currentColor" stroke="none" opacity=".6" />
          <path d="M64 68c4 26 14 48 30 64M136 68c-4 26-14 48-30 64" opacity=".25" />
        </g>
      );
    case "perfume":
      return (
        <g {...common}>
          <path d="M72 104c0-10 7-16 17-16h22c10 0 17 6 17 16v94c0 10-7 16-17 16H89c-10 0-17-6-17-16Z" />
          <path d="M88 88V66h24v22" />
          <path d="M84 52h32v14H84z" opacity=".7" />
          <path d="M72 128h56" opacity=".35" />
          <path d="M80 152h40v34H80z" opacity=".25" />
          <path d="M100 162l5 8 9 1-7 6 2 9-9-4-9 4 2-9-7-6 9-1Z" opacity=".5" />
        </g>
      );
    case "muffler":
      return (
        <g {...common}>
          <path d="M58 62c22 18 48 24 78 18l-8 34c-24 6-46 0-64-14Z" />
          <path d="M64 100c18 16 40 22 64 18l-10 66c-20 6-38 2-52-8Z" />
          <path d="M66 176l-2 26M78 182l-1 26M90 186l-1 26M102 188v26M114 188v26M126 186l2 26" opacity=".55" />
          <path d="M74 74c14 12 32 17 50 15M70 110c14 12 30 17 46 15" opacity=".25" />
          <path d="M54 58l6 4M140 76l4 2" opacity=".4" />
        </g>
      );
    default:
      return null;
  }
}

function isLight(hex: string) {
  const value = hex.replace("#", "");
  if (value.length !== 6) return false;
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.58;
}

const WIDE_ART: ArtIcon[] = [
  "sneaker",
  "sandal",
  "slipper",
  "formal",
  "heel",
  "sunglasses",
  "belt",
];

export function ArtIconGlyph({
  art,
  className,
  strokeWidth,
}: {
  art: ArtIcon;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox={WIDE_ART.includes(art) ? "18 92 164 128" : "18 28 164 210"}
      className={cn("h-full w-full", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth ?? 2.1}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <ArtGlyph art={art} />
    </svg>
  );
}

type ProductArtProps = {
  id: string;
  art: ArtIcon;
  palette?: [string, string];
  paletteOverride?: [string, string];
  colorName?: string;
  tone?: PlaceholderTone;
  className?: string;
  showCaption?: boolean;
  showMonogram?: boolean;
  rounded?: boolean;
  artScale?: number;
};

function sanitizeId(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, "-");
}

export function ProductArt({
  id,
  art,
  palette = ["var(--color-indigo)", "var(--color-magenta)"],
  paletteOverride,
  colorName,
  tone,
  className,
  showCaption = true,
  showMonogram = true,
  rounded = true,
  artScale = 1.95,
}: ProductArtProps) {
  const uid = sanitizeId(id);
  const placeholder = paletteOverride
    ? paletteFromColors(paletteOverride)
    : tone
      ? placeholderTone(tone)
      : placeholderPalette(id);
  const ink = placeholder.ink;
  const gold = placeholder.gold;
  const captionColor = ink;

  return (
    <svg
      viewBox="0 0 600 760"
      className={cn("h-full w-full", className)}
      role="img"
      aria-label={`${ART_LABELS[art]} illustration${colorName ? ` in ${colorName}` : ""} — product photography coming soon`}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={`${uid}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={placeholder.from} />
          <stop offset="100%" stopColor={placeholder.to} />
        </linearGradient>
        <radialGradient id={`${uid}-glow`} cx="50%" cy="38%" r="62%">
          <stop offset="0%" stopColor={gold} stopOpacity="0.23" />
          <stop offset="60%" stopColor={gold} stopOpacity="0.04" />
          <stop offset="100%" stopColor={gold} stopOpacity="0" />
        </radialGradient>
        <pattern
          id={`${uid}-lattice`}
          width="52"
          height="52"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <path
            d="M26 0L52 26 26 52 0 26Z"
            fill="none"
            stroke={gold}
            strokeWidth="0.7"
            opacity="0.16"
          />
          <circle cx="26" cy="26" r="1.6" fill={gold} opacity="0.28" />
          <path d="M26 18v16M18 26h16" stroke={gold} strokeWidth="0.5" opacity="0.1" />
        </pattern>
        <linearGradient id={`${uid}-icon`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={ink} />
          <stop offset="100%" stopColor={ink} stopOpacity="0.82" />
        </linearGradient>
      </defs>

      <rect width="600" height="760" fill={`url(#${uid}-bg)`} />
      <rect width="600" height="760" fill={`url(#${uid}-lattice)`} />
      <rect width="600" height="760" fill={`url(#${uid}-glow)`} />

      {showMonogram && (
        <text
          x="300"
          y="565"
          textAnchor="middle"
          fontFamily="Georgia, serif"
          fontSize="440"
          fill={gold}
          opacity="0.05"
        >
          B
        </text>
      )}

      {/* ornamental double frame */}
      <rect
        x="24"
        y="24"
        width="552"
        height="712"
        rx={rounded ? 26 : 0}
        fill="none"
        stroke={gold}
        strokeWidth="1"
        opacity="0.48"
      />
      <rect
        x="34"
        y="34"
        width="532"
        height="692"
        rx={rounded ? 20 : 0}
        fill="none"
        stroke={gold}
        strokeWidth="0.6"
        opacity="0.24"
      />

      {/* corner flourishes */}
      {[
        [52, 52, 1, 1],
        [548, 52, -1, 1],
        [52, 708, 1, -1],
        [548, 708, -1, -1],
      ].map(([x, y, sx, sy], i) => (
        <g
          key={i}
          transform={`translate(${x} ${y}) scale(${sx} ${sy})`}
          stroke={gold}
          fill="none"
          opacity="0.6"
        >
          <path d="M0 26C0 10 10 0 26 0" strokeWidth="1" />
          <path d="M8 26c8-10 10-12 20-18" strokeWidth="0.6" opacity=".5" />
          <circle cx="30" cy="0" r="1.6" fill={gold} stroke="none" />
        </g>
      ))}

      <g
        transform={`translate(300 355) scale(${artScale}) translate(-100 -130)`}
        color={ink}
        strokeLinecap="round"
      >
        <ArtGlyph art={art} />
      </g>

      {/* gold sparkles */}
      <g fill={gold} opacity="0.65">
        <path d="M474 190l3 9 9 3-9 3-3 9-3-9-9-3 9-3Z" />
        <path d="M122 452l2 6 6 2-6 2-2 6-2-6-6-2 6-2Z" opacity=".7" />
        <circle cx="462" cy="510" r="2" />
        <circle cx="140" cy="180" r="1.6" opacity=".6" />
      </g>

      {showCaption && (
        <>
          <path d="M240 678h120" stroke={gold} strokeWidth="0.8" opacity="0.6" />
          <text
            x="300"
            y="700"
            textAnchor="middle"
            fontFamily="'Plus Jakarta Sans', sans-serif"
            fontSize="10.5"
            letterSpacing="3.6"
            fill={captionColor}
            opacity="0.72"
          >
            BENGALOT · PHOTO COMING SOON
          </text>
        </>
      )}
    </svg>
  );
}

/* A decorative department visual, used for cards and heroes */
export function DepartmentArt({
  id,
  art,
  palette,
  className,
  word,
}: {
  id: string;
  art: ArtIcon;
  palette: [string, string];
  className?: string;
  word?: string;
}) {
  const uid = sanitizeId(id);
  const light = isLight(palette[1]) || isLight(palette[0]);
  const ink = light ? "var(--color-ink)" : "var(--color-ivory)";
  const gold = light ? "var(--color-gold-ink)" : "var(--color-saffron)";

  return (
    <svg
      viewBox="0 0 600 760"
      className={cn("h-full w-full", className)}
      role="img"
      aria-label={`${ART_LABELS[art]} department artwork`}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={`${uid}-dbg`} x1="0" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor={palette[0]} />
          <stop offset="100%" stopColor={palette[1]} />
        </linearGradient>
        <radialGradient id={`${uid}-dglow`} cx="70%" cy="20%" r="80%">
          <stop offset="0%" stopColor="var(--color-ivory)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--color-ivory)" stopOpacity="0" />
        </radialGradient>
        <pattern
          id={`${uid}-dlat`}
          width="64"
          height="64"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M32 2 62 32 32 62 2 32Z"
            fill="none"
            stroke={gold}
            strokeWidth="0.7"
            opacity="0.12"
          />
          <circle cx="32" cy="32" r="1.4" fill={gold} opacity="0.25" />
        </pattern>
      </defs>
      <rect width="600" height="760" fill={`url(#${uid}-dbg)`} />
      <rect width="600" height="760" fill={`url(#${uid}-dglat)`} />
      <rect width="600" height="760" fill={`url(#${uid}-dglow)`} />

      {/* arch */}
      <path
        d="M96 700V330c0-140 84-226 204-226s204 86 204 226v370"
        fill="none"
        stroke={gold}
        strokeWidth="1.2"
        opacity="0.55"
      />
      <path
        d="M112 700V334c0-128 78-212 188-212s188 84 188 212v366"
        fill="none"
        stroke={gold}
        strokeWidth="0.6"
        opacity="0.28"
      />

      {word && (
        <text
          x="300"
          y="470"
          textAnchor="middle"
          fontFamily="'Cormorant Garamond', Georgia, serif"
          fontSize="230"
          fill={ink}
          opacity="0.055"
          letterSpacing="8"
        >
          {word}
        </text>
      )}

      <g
        transform="translate(300 340) scale(1.7) translate(-100 -130)"
        color={ink}
      >
        <ArtGlyph art={art} />
      </g>

      <g fill={gold} opacity="0.7">
        <path d="M468 210l3 9 9 3-9 3-3 9-3-9-9-3 9-3Z" />
        <path d="M136 518l2 6 6 2-6 2-2 6-2-6-6-2 6-2Z" opacity=".7" />
        <circle cx="462" cy="538" r="2" />
      </g>

      <path
        d="M120 714h360"
        stroke={gold}
        strokeWidth="0.8"
        opacity="0.4"
      />
    </svg>
  );
}

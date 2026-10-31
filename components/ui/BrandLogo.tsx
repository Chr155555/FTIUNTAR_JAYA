export function BrandLogo({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <div className={`${className} flex items-center justify-center shrink-0`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-xs"
      >
        {/* Balon percakapan suara warna hitam (#0F172A) */}
        <path
          d="M 26 8 C 13 8 7 14 7 27 L 7 61 C 7 74 13 80 26 80 L 62 80 L 73 94 C 74.2 95.5 76.5 94.6 75.8 92.8 L 74 80 L 76 80 C 89 80 95 74 95 61 L 95 27 C 95 14 89 8 76 8 Z"
          fill="#0F172A"
        />
        {/* Siluet Monas & Kota Jakarta warna putih (#FFFFFF) */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          fill="#FFFFFF"
          d="M 16 71 L 16 57 L 22 57 L 22 51 L 28 51 L 28 71 L 32 71 L 32 44 C 32 37 35 34 40.5 34 C 46 34 49 37 49 44 L 49 71 L 45 71 L 45 66 L 43.5 64.5 L 43.5 63 L 48.5 63 L 49 22 L 47.8 21 L 47.8 19.5 L 50 19.5 L 50.4 14 C 50.4 11 51.5 8 51.5 7.5 C 51.5 8 52.6 11 52.6 14 L 53 19.5 L 55.2 19.5 L 55.2 21 L 54 22 L 54.5 63 L 59.5 63 L 59.5 64.5 L 58 66 L 58 71 L 61 71 L 61 38 C 61 34 64 31 67.5 29 L 67.5 71 L 70 71 L 70 45 L 75 45 L 75 54 L 80 54 L 80 62 L 85 62 L 85 71 Z M 37.5 71 L 37.5 47 C 37.5 43.5 38.5 41 40.5 41 C 42.5 41 43.5 43.5 43.5 47 L 43.5 71 Z M 63.5 44 L 64.8 44 L 64.8 66 L 63.5 66 Z"
        />
      </svg>
    </div>
  );
}


import Header from "@/components/catalog/Header";

// ── SOROS starburst mark (the spinning icon only, no wordmark) ───────────────
function SorosMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 38 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* 10 blade shapes arranged around the center (~19, ~19.5) */}
      <path d="M11.1889 26.9429C11.1889 25.6173 10.1142 24.5419 8.78792 24.5419H0.285645V25.0901C0.285645 26.4157 1.3603 27.4911 2.68659 27.4911H11.1889V26.9429Z" fill="currentColor"/>
      <path d="M1.05798 16.5211L7.93667 21.5188L8.25935 21.075C9.03888 20.0025 8.80103 18.5015 7.72855 17.722L0.849863 12.7243L0.527901 13.1681C-0.251626 14.2406 -0.0137792 15.7416 1.0587 16.5211H1.05798Z" fill="currentColor"/>
      <path d="M8.81545 14.7764L9.33683 14.6068C10.5978 14.1971 11.2875 12.8425 10.8785 11.5815L8.25129 3.49542L7.72991 3.66511C6.46889 4.07481 5.77928 5.42938 6.18899 6.68967L8.81617 14.7757L8.81545 14.7764Z" fill="currentColor"/>
      <path d="M17.0364 8.46553L19.6636 0.379481L19.1422 0.209796C17.8812 -0.199909 16.5274 0.490426 16.1177 1.75072L13.4905 9.83677L14.0119 10.0065C15.2729 10.4162 16.6267 9.72582 17.0364 8.46553Z" fill="currentColor"/>
      <path d="M23.8491 9.56413L30.7278 4.56646L30.4051 4.12267C29.6256 3.05019 28.1245 2.81234 27.052 3.59187L20.1733 8.58954L20.496 9.03332C21.2756 10.1058 22.7766 10.3437 23.8491 9.56413Z" fill="currentColor"/>
      <path d="M28.7171 14.4581H37.2194V13.9099C37.2194 12.5844 36.1447 11.509 34.8184 11.509H26.3162V12.0572C26.3162 13.3827 27.3908 14.4581 28.7171 14.4581Z" fill="currentColor"/>
      <path d="M36.4463 22.4789L29.5676 17.4812L29.2449 17.925C28.4654 18.9975 28.7033 20.4985 29.7757 21.278L36.6544 26.2757L36.9764 25.8319C37.7559 24.7594 37.5181 23.2584 36.4456 22.4789H36.4463Z" fill="currentColor"/>
      <path d="M28.6887 24.225L28.1673 24.3947C26.9063 24.8044 26.2167 26.159 26.6257 27.4193L29.2528 35.5053L29.7742 35.3356C31.0352 34.9259 31.7248 33.5714 31.3151 32.3111L28.688 24.225H28.6887Z" fill="currentColor"/>
      <path d="M20.4678 30.5345L17.8406 38.6205L18.362 38.7902C19.623 39.1999 20.9768 38.5096 21.3865 37.2493L24.0137 29.1632L23.4923 28.9935C22.2313 28.5838 20.8775 29.2742 20.4678 30.5352V30.5345Z" fill="currentColor"/>
      <path d="M13.6551 29.4359L6.77637 34.4335L7.09905 34.8773C7.87858 35.9498 9.37962 36.1876 10.4521 35.4081L17.3308 30.4104L17.0081 29.9667C16.2286 28.8942 14.7275 28.6563 13.6551 29.4359Z" fill="currentColor"/>
    </svg>
  );
}

// ── Full SOROS lockup (mark + wordmark) ──────────────────────────────────────
function SorosLogo({ className }: { className?: string }) {
  return (
    <svg
      width="120"
      height="39"
      viewBox="0 0 120 39"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <clipPath id="soros-clip">
          <rect width="119.358" height="38.8676" fill="white" transform="translate(0 0.0662231)" />
        </clipPath>
      </defs>
      <g clipPath="url(#soros-clip)">
        {/* SOROS wordmark */}
        <g>
          <path d="M50.6141 21.8618C50.6939 23.4716 52.1159 24.6514 54.3957 24.6514C56.3268 24.6514 57.6936 23.8204 57.6936 22.5593C57.6936 20.8429 56.1919 20.7088 54.1528 20.4673C51.0956 20.0917 48.6548 19.4753 48.6548 16.6328C48.6548 14.139 50.9346 12.5024 54.0194 12.5292C57.1302 12.5567 59.3825 14.0049 59.5979 16.8474H57.3441C57.1831 15.453 55.8953 14.4066 54.0194 14.4066C52.1434 14.4066 50.828 15.2122 50.828 16.4718C50.828 17.9736 52.2754 18.1614 54.2608 18.4028C57.3717 18.7785 59.8647 19.368 59.8647 22.3991C59.8647 24.9472 57.4246 26.5295 54.395 26.5295C50.8541 26.5295 48.414 24.8667 48.3604 21.8625H50.6134L50.6141 21.8618Z" fill="currentColor"/>
          <path d="M62.4963 19.529C62.4963 15.3717 65.2874 12.5292 69.2822 12.5292C73.277 12.5292 76.0681 15.3717 76.0681 19.529C76.0681 23.6862 73.2799 26.5288 69.2822 26.5288C65.2845 26.5288 62.4963 23.6862 62.4963 19.529ZM73.8143 19.529C73.8143 16.6059 71.9899 14.4878 69.2815 14.4878C66.5731 14.4878 64.7486 16.6066 64.7486 19.529C64.7486 22.4513 66.5731 24.5716 69.2815 24.5716C71.9899 24.5716 73.8143 22.452 73.8143 19.529Z" fill="currentColor"/>
          <path d="M79.0303 12.4712H84.5102C87.4078 12.4712 89.3527 14.1985 89.3527 16.8982C89.3527 18.7632 88.2816 20.2534 86.6537 20.8284L89.592 26.3678H87.0511L84.3695 21.3252H81.3123V26.3678H79.0303V12.4712ZM81.3123 14.4566V19.3405H84.3311C85.959 19.3405 87.0105 18.3869 87.0105 16.8982C87.0105 15.4095 85.959 14.4559 84.3311 14.4559H81.3123V14.4566Z" fill="currentColor"/>
          <path d="M91.6367 19.529C91.6367 15.3717 94.4249 12.5292 98.4226 12.5292C102.42 12.5292 105.208 15.3717 105.208 19.529C105.208 23.6862 102.417 26.5288 98.4226 26.5288C94.4278 26.5288 91.6367 23.6862 91.6367 19.529ZM102.955 19.529C102.955 16.6059 101.13 14.4878 98.4219 14.4878C95.7135 14.4878 93.889 16.6066 93.889 19.529C93.889 22.4513 95.7135 24.5716 98.4219 24.5716C101.13 24.5716 102.955 22.452 102.955 19.529Z" fill="currentColor"/>
          <path d="M110.039 21.8618C110.118 23.4716 111.54 24.6514 113.82 24.6514C115.751 24.6514 117.117 23.8204 117.117 22.5593C117.117 20.8429 115.616 20.7088 113.578 20.4673C110.521 20.0917 108.079 19.4753 108.079 16.6328C108.079 14.139 110.358 12.5024 113.445 12.5292C116.555 12.5567 118.808 14.0049 119.021 16.8474H116.768C116.608 15.453 115.319 14.4066 113.444 14.4066C111.569 14.4066 110.251 15.2122 110.251 16.4718C110.251 17.9736 111.7 18.1614 113.684 18.4028C116.795 18.7785 119.29 19.368 119.29 22.3991C119.29 24.9472 116.848 26.5295 113.82 26.5295C110.279 26.5295 107.839 24.8667 107.786 21.8625H110.039V21.8618Z" fill="currentColor"/>
        </g>
        {/* Starburst mark */}
        <g>
          <path d="M11.1889 26.9429C11.1889 25.6173 10.1142 24.5419 8.78792 24.5419H0.285645V25.0901C0.285645 26.4157 1.3603 27.4911 2.68659 27.4911H11.1889V26.9429Z" fill="currentColor"/>
          <path d="M1.05798 16.5211L7.93667 21.5188L8.25935 21.075C9.03888 20.0025 8.80103 18.5015 7.72855 17.722L0.849863 12.7243L0.527901 13.1681C-0.251626 14.2406 -0.0137792 15.7416 1.0587 16.5211H1.05798Z" fill="currentColor"/>
          <path d="M8.81545 14.7764L9.33683 14.6068C10.5978 14.1971 11.2875 12.8425 10.8785 11.5815L8.25129 3.49542L7.72991 3.66511C6.46889 4.07481 5.77928 5.42938 6.18899 6.68967L8.81617 14.7757L8.81545 14.7764Z" fill="currentColor"/>
          <path d="M17.0364 8.46553L19.6636 0.379481L19.1422 0.209796C17.8812 -0.199909 16.5274 0.490426 16.1177 1.75072L13.4905 9.83677L14.0119 10.0065C15.2729 10.4162 16.6267 9.72582 17.0364 8.46553Z" fill="currentColor"/>
          <path d="M23.8491 9.56413L30.7278 4.56646L30.4051 4.12267C29.6256 3.05019 28.1245 2.81234 27.052 3.59187L20.1733 8.58954L20.496 9.03332C21.2756 10.1058 22.7766 10.3437 23.8491 9.56413Z" fill="currentColor"/>
          <path d="M28.7171 14.4581H37.2194V13.9099C37.2194 12.5844 36.1447 11.509 34.8184 11.509H26.3162V12.0572C26.3162 13.3827 27.3908 14.4581 28.7171 14.4581Z" fill="currentColor"/>
          <path d="M36.4463 22.4789L29.5676 17.4812L29.2449 17.925C28.4654 18.9975 28.7033 20.4985 29.7757 21.278L36.6544 26.2757L36.9764 25.8319C37.7559 24.7594 37.5181 23.2584 36.4456 22.4789H36.4463Z" fill="currentColor"/>
          <path d="M28.6887 24.225L28.1673 24.3947C26.9063 24.8044 26.2167 26.159 26.6257 27.4193L29.2528 35.5053L29.7742 35.3356C31.0352 34.9259 31.7248 33.5714 31.3151 32.3111L28.688 24.225H28.6887Z" fill="currentColor"/>
          <path d="M20.4678 30.5345L17.8406 38.6205L18.362 38.7902C19.623 39.1999 20.9768 38.5096 21.3865 37.2493L24.0137 29.1632L23.4923 28.9935C22.2313 28.5838 20.8775 29.2742 20.4678 30.5352V30.5345Z" fill="currentColor"/>
          <path d="M13.6551 29.4359L6.77637 34.4335L7.09905 34.8773C7.87858 35.9498 9.37962 36.1876 10.4521 35.4081L17.3308 30.4104L17.0081 29.9667C16.2286 28.8942 14.7275 28.6563 13.6551 29.4359Z" fill="currentColor"/>
        </g>
      </g>
    </svg>
  );
}

// ── Skeleton ─────────────────────────────────────────────────────────────────

export default function ItemLoading() {
  return (
    <div className="min-h-screen bg-black text-zinc-50">
      <Header />

      <main className="mx-auto max-w-4xl px-6 py-10">
        {/* Back link skeleton */}
        <div className="mb-8 h-2.5 w-24 animate-pulse rounded-full bg-zinc-900" />

        <div className="grid gap-10 sm:grid-cols-[320px_1fr]">
          {/* ── Left: image placeholder ── */}
          <div className="max-w-xs mx-auto w-full sm:max-w-none sm:mx-0">
            {/* Main image — logo centred inside */}
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-zinc-900 bg-zinc-950 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4 select-none">
                {/* Spinning starburst */}
                <div
                  className="animate-spin text-zinc-800"
                  style={{ animationDuration: "2.5s" }}
                >
                  <SorosMark className="h-10 w-10" />
                </div>
                {/* Wordmark */}
                <SorosLogo className="h-5 w-auto text-zinc-800" />
              </div>
            </div>

            {/* Thumbnail strip skeleton */}
            <div className="mt-3 flex gap-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-20 w-16 shrink-0 animate-pulse rounded-xl bg-zinc-900"
                  style={{ animationDelay: `${i * 80}ms` }}
                />
              ))}
            </div>
          </div>

          {/* ── Right: details skeleton ── */}
          <div className="space-y-6">
            {/* Brand + title */}
            <div className="space-y-3">
              <div className="h-2.5 w-20 animate-pulse rounded-full bg-zinc-900" />
              <div className="h-7 w-3/4 animate-pulse rounded-lg bg-zinc-900" />
              <div className="h-7 w-1/2 animate-pulse rounded-lg bg-zinc-900" style={{ animationDelay: "60ms" }} />
              <div className="h-3 w-40 animate-pulse rounded-full bg-zinc-900" style={{ animationDelay: "120ms" }} />
            </div>

            {/* Price + badge */}
            <div className="flex items-center gap-4">
              <div className="h-8 w-24 animate-pulse rounded-lg bg-zinc-900" />
              <div className="h-5 w-16 animate-pulse rounded-full bg-zinc-900" />
            </div>

            {/* Condition */}
            <div className="space-y-2">
              <div className="h-2.5 w-16 animate-pulse rounded-full bg-zinc-900" />
              <div className="h-3 w-28 animate-pulse rounded-full bg-zinc-900" />
            </div>

            {/* How to Buy box */}
            <div className="rounded-2xl border border-zinc-900 bg-zinc-950/60 p-4 space-y-3">
              <div className="h-2.5 w-20 animate-pulse rounded-full bg-zinc-800" />
              <div className="space-y-2">
                <div className="h-3 w-full animate-pulse rounded-full bg-zinc-800" />
                <div className="h-3 w-5/6 animate-pulse rounded-full bg-zinc-800" style={{ animationDelay: "40ms" }} />
                <div className="h-3 w-2/3 animate-pulse rounded-full bg-zinc-800" style={{ animationDelay: "80ms" }} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

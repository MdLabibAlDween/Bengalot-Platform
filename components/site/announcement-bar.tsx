const messages = [
  "Free delivery across Bangladesh over ৳2,000",
  "Cash on delivery available",
  "Digital access opens in your library after payment",
];

export function AnnouncementBar() {
  return (
    <div className="relative overflow-hidden bg-navy text-cream">
      <p className="sr-only">
        Free delivery across Bangladesh over ৳2,000. Cash on delivery
        available. Digital access opens after payment.
      </p>
      <div className="marquee-mask overflow-hidden" aria-hidden="true">
        <div className="marquee-track items-center py-2">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center">
              {messages.map((message) => (
                <span
                  key={`${copy}-${message}`}
                  className="flex items-center gap-5 px-6 text-[0.6rem] font-bold uppercase tracking-[0.16em] text-cream/85 sm:text-[0.64rem]"
                >
                  <svg
                    viewBox="0 0 12 12"
                    className="size-2.5 text-butter"
                    fill="currentColor"
                  >
                    <path d="M6 0 7.3 4.7 12 6 7.3 7.3 6 12 4.7 7.3 0 6l4.7-1.3Z" />
                  </svg>
                  {message}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

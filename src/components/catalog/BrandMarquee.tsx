'use client';



const MARQUEE_ITEMS = [
  'DUNK LOW PANDA',
  '•',
  'NB 550 WHITE GREY',
  '•',
  'AIR JORDAN 1 HIGH',
  '•',
  'AIR MAX 90',
  '•',
  'FORUM LOW CL',
  '•',
  'YEEZY BOOST 350',
  '•',
  'AIR FORCE 1',
  '•',
  'NB 2002R',
  '•',
];

export function BrandMarquee() {
  return (
    <div className="relative overflow-hidden border-y border-white/5 bg-[#0a0a0a] py-5">
      {/* Left fade */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
      {/* Right fade */}
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10 pointer-events-none" />

      <div className="flex animate-marquee whitespace-nowrap">
        {/* Double the items for seamless loop */}
        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
          <span
            key={i}
            className={`mx-4 text-sm font-display font-bold tracking-[0.2em] uppercase ${item === '•'
              ? 'text-[#ffd900]/40'
              : 'text-white/30 hover:text-[#ffd900]/80 transition-colors duration-300 cursor-default'
              }`}
          >
            {item}
          </span>
        ))}
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.33%);
          }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
          will-change: transform;
        }
      `}</style>
    </div>
  );
}

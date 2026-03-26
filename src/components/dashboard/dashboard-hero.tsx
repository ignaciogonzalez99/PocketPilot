import Image from "next/image";

interface DashboardHeroProps {
  children?: React.ReactNode;
}

export function DashboardHero({ children }: DashboardHeroProps) {
  return (
    <div className="relative -mx-4 md:-mx-8 -mt-6 mb-6 overflow-hidden rounded-b-2xl shadow-lg">
      {/* Banner image */}
      <div className="h-[200px] sm:h-[240px] md:h-[260px]">
        <Image
          src="/banner.png"
          fill
          priority
          className="object-cover object-center"
          alt="PocketPilot hero banner"
        />
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />

      {/* MonthPicker slot — top-right */}
      {children && (
        <div className="absolute top-4 right-4 md:top-5 md:right-6 bg-black/20 rounded-xl backdrop-blur-sm px-1">
          {children}
        </div>
      )}

      {/* Text — bottom-left */}
      <div className="absolute bottom-0 left-0 right-0 px-6 md:px-10 pb-6 md:pb-7">
        <h1 className="font-serif text-3xl sm:text-4xl md:text-[2.75rem] font-normal tracking-tight text-white leading-none">
          PocketPilot
        </h1>
        <p className="text-sm sm:text-base text-white/80 mt-1.5 font-sans font-normal">
          Your money, wherever it is. Clear.
        </p>
      </div>
    </div>
  );
}

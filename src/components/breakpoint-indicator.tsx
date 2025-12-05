// src/components/BreakpointIndicator.tsx
const BreakpointIndicator = () => {
  if (import.meta.env.PROD) return null; // Hide in production

  return (
    <div className="fixed bottom-2 left-2 z-50 text-xs px-2 py-1 rounded bg-black text-white opacity-60 pointer-events-none">
      <div className="block sm:hidden md:hidden lg:hidden xl:hidden">xs</div>
      <div className="hidden sm:block md:hidden lg:hidden xl:hidden">sm</div>
      <div className="hidden md:block lg:hidden xl:hidden">md</div>
      <div className="hidden lg:block xl:hidden">lg</div>
      <div className="hidden xl:block">xl</div>
    </div>
  );
};

export default BreakpointIndicator;

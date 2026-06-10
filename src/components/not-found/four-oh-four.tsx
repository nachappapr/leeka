function FourOhFour() {
  return (
    <div
      // eslint-disable-next-line better-tailwindcss/no-restricted-classes -- bespoke display numeral; exceeds all semantic type tokens (132px/96px) and requires sub-1 leading (0.9); single-use carve-out per D1
      className="flex items-center font-sans font-extrabold tabular-nums text-ink text-[132px] tracking-[-5px] leading-[0.9] max-mobile:text-[96px] max-mobile:tracking-[-3px]"
      aria-hidden="true"
    >
      4<span className="text-coral">0</span>4
    </div>
  );
}

export { FourOhFour };

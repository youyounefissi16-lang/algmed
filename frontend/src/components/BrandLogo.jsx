export default function BrandLogo({ width, height, color }) {
  const w = width || 38;
  const h = height || 24;

  return (
    <span
      role="img"
      aria-label="algmed"
      style={{
        position: 'relative',
        display: 'inline-block',
        width: w,
        height: h,
        verticalAlign: 'middle',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: color || 'currentColor',
          WebkitMaskImage: 'url(/logo-a.svg)',
          maskImage: 'url(/logo-a.svg)',
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskSize: 'contain',
          maskSize: 'contain',
          WebkitMaskPosition: 'center',
          maskPosition: 'center',
        }}
      />
      <img
        src="/logo-cross.svg"
        alt=""
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
      />
    </span>
  );
}

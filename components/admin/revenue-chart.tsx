import { formatMoney } from "@/lib/utils";

type Point = { label: string; value: number };

function shortMoney(value: number) {
  if (value >= 100000) return `৳${Math.round(value / 1000)}k`;
  if (value >= 1000) return `৳${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`;
  return `৳${value}`;
}

export function RevenueChart({ data }: { data: Point[] }) {
  const width = 720;
  const height = 240;
  const padX = 16;
  const padTop = 18;
  const padBottom = 30;
  const innerW = width - padX * 2;
  const innerH = height - padTop - padBottom;
  const max = Math.max(...data.map((point) => point.value), 1000);
  const points = data.map((point, index) => {
    const x = padX + (data.length <= 1 ? 0 : (index / (data.length - 1)) * innerW);
    const y = padTop + innerH - (point.value / max) * innerH;
    return { ...point, x, y };
  });
  const line = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
    .join(" ");
  const area =
    points.length > 0
      ? `${line} L ${points[points.length - 1]?.x ?? padX} ${padTop + innerH} L ${points[0]?.x ?? padX} ${padTop + innerH} Z`
      : "";
  const total = data.reduce((sum, point) => sum + point.value, 0);
  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[0.56rem] font-extrabold uppercase tracking-[0.13em] text-muted">
            Revenue · last 14 days
          </p>
          <p className="price mt-1 font-display text-[2rem] leading-none tracking-[-0.04em] text-ink">
            {formatMoney(total)}
          </p>
        </div>
        <div className="flex items-center gap-4 text-[0.58rem] font-semibold text-muted">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-teal" />
            Order value
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-butter" />
            Confirmed
          </span>
        </div>
      </div>

      <div className="mt-4 overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-auto w-full"
          role="img"
          aria-label={`Revenue over the last 14 days totals ${formatMoney(total)}`}
        >
          <defs>
            <linearGradient id="admin-revenue-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0d6f6d" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#0d6f6d" stopOpacity="0.015" />
            </linearGradient>
          </defs>

          {gridLines.map((position) => {
            const y = padTop + innerH * position;
            return (
              <g key={position}>
                <line
                  x1={padX}
                  x2={width - padX}
                  y1={y}
                  y2={y}
                  stroke="var(--line)"
                  strokeWidth="1"
                  strokeDasharray={position === 1 ? undefined : "3 5"}
                  opacity="0.8"
                />
                <text
                  x={width - padX}
                  y={y - 4}
                  textAnchor="end"
                  className="fill-[#8b8579] text-[9px]"
                >
                  {shortMoney(max * (1 - position))}
                </text>
              </g>
            );
          })}

          {area ? <path d={area} fill="url(#admin-revenue-fill)" /> : null}
          {line ? (
            <path
              d={line}
              fill="none"
              stroke="#0d6f6d"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}

          {points.map((point) => (
            <g key={point.label}>
              {point.value > 0 ? (
                <>
                  <circle cx={point.x} cy={point.y} r="5" fill="#ffffff" stroke="#0d6f6d" strokeWidth="2" />
                  <circle cx={point.x} cy={point.y} r="2" fill="#0d6f6d" />
                </>
              ) : null}
              <text
                x={point.x}
                y={height - 8}
                textAnchor="middle"
                className="fill-[#8b8579] text-[9px]"
              >
                {point.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}


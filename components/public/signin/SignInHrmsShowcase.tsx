import React from 'react';

type MiniCardProps = {
  title: string;
  accent: string;
  accentRight?: boolean;
  dot: string;
  border: string;
  children: React.ReactNode;
};

function MiniCard({ title, accent, accentRight = false, dot, border, children }: MiniCardProps) {
  return (
    <div className={`relative overflow-hidden rounded-[14px] border bg-white/95 px-4 py-3 shadow-[0_16px_36px_rgba(15,23,42,0.08)] ${border}`}>
      <span
        className={`absolute top-0 h-full w-[6px] ${accentRight ? 'right-0 rounded-l-[10px]' : 'left-0 rounded-r-[10px]'}`}
        style={{ background: accent }}
      />
      <span className="status-dot absolute right-3 top-3 h-[8px] w-[8px] rounded-full" style={{ background: dot }} />
      <p className="mb-2 text-[9px] font-black tracking-[0.18em]" style={{ color: accent }}>
        {title}
      </p>
      <div className="border-t border-slate-100 pt-3">{children}</div>
    </div>
  );
}

function CoreHubIcon() {
  return (
    <svg viewBox="0 0 32 32" className="h-[28px] w-[28px] text-blue-800" aria-hidden="true">
      <circle cx="10" cy="11" r="4" fill="currentColor" opacity="0.28" />
      <circle cx="22" cy="11" r="4" fill="currentColor" opacity="0.52" />
      <path d="M4 24c0-3.5 2.8-6 6-6s6 2.5 6 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M12 24c0-3.5 2.8-6 6-6s6 2.5 6 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[16px] w-[16px] text-emerald-700" aria-hidden="true">
      <path d="M12 2l7 3v5c0 5.2-2.9 9.4-7 11-4.1-1.6-7-5.8-7-11V5l7-3z" fill="currentColor" opacity="0.2" />
      <path d="M12 2l7 3v5c0 5.2-2.9 9.4-7 11-4.1-1.6-7-5.8-7-11V5l7-3z" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9 12.2l2 2 4-4.3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SignInHrmsShowcase() {
  return (
    <div className="pointer-events-none hidden xl:block">
      <div className="mx-auto max-w-[620px]">
        <div className="mb-3 text-center">
          <p className="text-[16px] font-black tracking-[0.22em] text-slate-900">{"PEOPLE'S PLATFORM"}</p>
          <p className="mt-1 text-[9px] font-semibold tracking-[0.42em] text-slate-400">INTEGRATED HRMS CONTROL CENTER</p>
        </div>

        <div className="border-t border-slate-200/80 pt-4">
          <div className="grid grid-cols-[1fr_170px_1fr] gap-3">
            <MiniCard title="PEOPLE MANAGER" accent="#1d4ed8" dot="#22c55e" border="border-blue-200 pl-5">
              <div className="mb-3 flex gap-1.5">
                {[
                  ['#dbeafe', '#3b82f6'],
                  ['#ede9fe', '#7c3aed'],
                  ['#dbeafe', '#3b82f6'],
                  ['#fef3c7', '#ca8a04'],
                  ['#dbeafe', '#3b82f6'],
                ].map(([bg, fg], index) => (
                  <span
                    key={index}
                    className="avatar-chip flex h-[28px] w-[28px] items-center justify-center rounded-full border-[1.5px]"
                    style={{ animationDelay: `${index * 160}ms`, background: bg, borderColor: fg }}
                  >
                    <span
                      className="avatar-core h-[9px] w-[9px] rounded-full opacity-60"
                      style={{ background: fg, animationDelay: `${index * 160}ms` }}
                    />
                  </span>
                ))}
              </div>
              <div className="flex gap-5">
                <div>
                  <p className="text-[8px] text-slate-500">HEADCOUNT</p>
                  <p className="text-[19px] font-black leading-none text-blue-900">1,248</p>
                </div>
                <div>
                  <p className="text-[8px] text-slate-500">DEPTS</p>
                  <p className="text-[19px] font-black leading-none text-blue-900">24</p>
                </div>
              </div>
            </MiniCard>

            <div className="row-span-2 flex items-center justify-center">
              <div className="relative flex h-[170px] w-[170px] items-center justify-center">
                <div className="hub-ring absolute h-[150px] w-[150px] rounded-full border border-dashed border-sky-300 opacity-70" />
                <div className="hub-shell relative flex h-[132px] w-[132px] flex-col items-center justify-center rounded-full border-2 border-sky-400 bg-white shadow-[0_0_0_10px_rgba(219,234,254,1),0_0_0_20px_rgba(239,246,255,1)]">
                  <CoreHubIcon />
                  <span className="mt-1 text-[8px] font-black tracking-[0.24em] text-blue-800">HRMS CORE</span>
                </div>
              </div>
            </div>

            <MiniCard title="PAYROLL ENGINE" accent="#6d28d9" dot="#7c3aed" border="border-violet-200 pr-5" accentRight>
              <div className="mb-2 flex h-[64px] items-end gap-[4px]">
                {[40, 60, 51, 66, 54, 76].map((height, index) => (
                  <div key={index} className="flex flex-1 flex-col items-center">
                    <span
                      className="payroll-bar w-full rounded-t-[4px]"
                      style={{
                        height,
                        animationDelay: `${index * 140}ms`,
                        background: ['#c4b5fd', '#a78bfa', '#c4b5fd', '#7c3aed', '#a78bfa', '#6d28d9'][index],
                      }}
                    />
                    <span className="mt-1 text-[6px] text-slate-400">{['OCT', 'NOV', 'DEC', 'JAN', 'FEB', 'MAR'][index]}</span>
                  </div>
                ))}
              </div>
              <p className="payroll-total text-right text-[17px] font-black text-violet-900">INR 4.2M</p>
              <p className="text-right text-[8px] tracking-[0.16em] text-slate-400">MONTHLY</p>
            </MiniCard>

            <MiniCard title="ATTENDANCE" accent="#059669" dot="#10b981" border="border-emerald-200 pl-5">
              <div className="flex items-center gap-3">
                <div className="relative h-[66px] w-[66px]">
                  <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90" aria-hidden="true">
                    <circle cx="32" cy="32" r="26" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="2" />
                    <circle
                      cx="32"
                      cy="32"
                      r="26"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray="164"
                      strokeDashoffset="164"
                      className="attendance-ring"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="attendance-pct text-[12px] font-black text-emerald-900">84%</span>
                    <span className="text-[6px] tracking-[0.16em] text-emerald-400">ON-TIME</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-[8px] text-slate-500">PRESENT</p>
                    <p className="text-[16px] font-black leading-none text-emerald-900">1,048</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-amber-500">ABSENT</p>
                    <p className="text-[16px] font-black leading-none text-amber-700">200</p>
                  </div>
                </div>
              </div>
            </MiniCard>

            <MiniCard title="ANALYTICS" accent="#6d28d9" dot="#7c3aed" border="border-violet-200 pr-5" accentRight>
              <div className="relative">
                <span className="absolute right-0 top-0 text-[8px] font-bold text-emerald-600">+3.2%</span>
                <p className="mb-1 text-[8px] text-slate-400">TURNOVER RATE</p>
                <svg viewBox="0 0 160 60" className="h-[62px] w-full" aria-hidden="true">
                  <polygon
                    className="analytics-fill"
                    points="0,60 18,42 32,50 48,28 62,35 76,18 90,25 104,8 118,15 132,0 146,5 160,0 160,60"
                    fill="#7c3aed"
                    opacity="0.08"
                  />
                  <polyline
                    className="analytics-line"
                    points="0,60 18,42 32,50 48,28 62,35 76,18 90,25 104,8 118,15 132,0 146,5 160,0"
                    fill="none"
                    stroke="#7c3aed"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="160" cy="0" r="3.4" fill="#7c3aed" className="analytics-ping" />
                </svg>
              </div>
            </MiniCard>

            <MiniCard title="LEAVES AND BENEFITS" accent="#0891b2" dot="#0891b2" border="border-sky-200 pl-5">
              <div className="space-y-2.5">
                {[
                  ['CASUAL', 80, '#38bdf8'],
                  ['EARNED', 69, '#a78bfa'],
                  ['MEDICAL', 46, '#34d399'],
                  ['MATERNITY', 20, '#fbbf24'],
                ].map(([label, value, color], index) => (
                  <div key={label}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-[8px] text-slate-500">{label}</span>
                      <span className="text-[7px] font-bold" style={{ color: String(color) }}>
                        {value}%
                      </span>
                    </div>
                    <div className="h-[6px] overflow-hidden rounded-[4px] bg-slate-100">
                      <div
                        className="benefit-bar h-full rounded-[4px]"
                        style={{ width: `${value}%`, background: String(color), animationDelay: `${index * 180 + 180}ms` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </MiniCard>

            <div />

            <MiniCard title="COMPLIANCE AND TAX" accent="#059669" dot="#10b981" border="border-emerald-200 pr-5" accentRight>
              <div className="mb-3 flex items-center gap-3">
                <span className="flex h-[30px] w-[30px] items-center justify-center rounded-[7px] border border-emerald-400 bg-emerald-100">
                  <ShieldIcon />
                </span>
                <div>
                  <p className="text-[9px] font-bold text-emerald-900">PF / ESI / PT</p>
                  <p className="text-[7px] tracking-[0.16em] text-emerald-400">TDS COMPUTED</p>
                </div>
              </div>
              <div className="space-y-1.5 text-[8px]">
                {[
                  ['- Form 16 Generated', 'text-emerald-700'],
                  ['- ITR Filing Ready', 'text-emerald-700'],
                  ['- EPF Challan Pending', 'text-amber-700'],
                  ['- Labour Law Audit OK', 'text-emerald-700'],
                ].map(([label, color], index) => (
                  <p key={label} className={`compliance-item ${color}`} style={{ animationDelay: `${index * 180 + 240}ms` }}>
                    {label}
                  </p>
                ))}
              </div>
            </MiniCard>
          </div>
        </div>
      </div>

      <style jsx>{`
        .status-dot {
          animation: statusPulse 2.4s ease-in-out infinite;
        }

        .avatar-chip {
          animation: avatarBob 3.8s ease-in-out infinite;
        }

        .avatar-core {
          animation: avatarPulse 3.8s ease-in-out infinite;
        }

        .hub-ring {
          animation: spin 12s linear infinite;
        }

        .hub-shell {
          animation: hubFloat 3.8s ease-in-out infinite;
        }

        .payroll-bar {
          transform-origin: bottom;
          animation: payrollGrow 3.8s ease-in-out infinite;
        }

        .payroll-total {
          animation: totalPulse 3.8s ease-in-out infinite;
        }

        .attendance-ring {
          animation: attendanceDraw 3.8s ease-in-out infinite;
        }

        .attendance-pct {
          animation: totalPulse 3.8s ease-in-out infinite;
        }

        .analytics-ping {
          animation: statusPulse 2s ease-in-out infinite;
        }

        .analytics-line {
          stroke-dasharray: 220;
          stroke-dashoffset: 220;
          animation: analyticsDraw 3.8s ease-in-out infinite;
        }

        .analytics-fill {
          opacity: 0;
          animation: analyticsFill 3.8s ease-in-out infinite;
        }

        .benefit-bar {
          transform-origin: left;
          animation: benefitGrow 3.8s ease-in-out infinite;
        }

        .compliance-item {
          opacity: 0;
          transform: translateX(-8px);
          animation: complianceReveal 3.8s ease-in-out infinite;
        }

        @keyframes statusPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.16); opacity: 0.45; }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes avatarBob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }

        @keyframes avatarPulse {
          0%, 100% { transform: scale(0.92); opacity: 0.45; }
          50% { transform: scale(1); opacity: 0.72; }
        }

        @keyframes hubFloat {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-4px) scale(1.015); }
        }

        @keyframes payrollGrow {
          0% { transform: scaleY(0.18); opacity: 0.55; }
          22%, 100% { transform: scaleY(1); opacity: 1; }
        }

        @keyframes totalPulse {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.04); opacity: 1; }
        }

        @keyframes attendanceDraw {
          0% { stroke-dashoffset: 164; }
          24%, 100% { stroke-dashoffset: 26; }
        }

        @keyframes analyticsDraw {
          0% { stroke-dashoffset: 220; }
          28%, 100% { stroke-dashoffset: 0; }
        }

        @keyframes analyticsFill {
          0%, 22% { opacity: 0; }
          32%, 100% { opacity: 0.08; }
        }

        @keyframes benefitGrow {
          0% { transform: scaleX(0); opacity: 0.55; }
          24%, 100% { transform: scaleX(1); opacity: 1; }
        }

        @keyframes complianceReveal {
          0%, 30% { opacity: 0; transform: translateX(-8px); }
          42%, 100% { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}



/** Piku: a small field-guide companion. Decorative alongside its visible name. */
export function PikuMascot({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 240 240" className={className} fill="none">
      <ellipse cx="120" cy="216" rx="65" ry="8" fill="#064e3b" opacity=".08" />
      <path d="M63 180C43 159 48 121 61 102C57 79 69 64 90 64C102 37 136 38 150 63C176 54 196 76 185 103C212 133 194 184 169 196C129 217 85 205 63 180Z" fill="#dcebdc" stroke="#064e3b" strokeWidth="3" />
      <path d="M74 150C62 137 56 139 53 149M166 150C181 137 189 140 192 152" stroke="#064e3b" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="96" cy="112" rx="5" ry="7" fill="#064e3b" />
      <ellipse cx="146" cy="112" rx="5" ry="7" fill="#064e3b" />
      <path d="M112 124Q121 134 130 124" stroke="#064e3b" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="82" cy="125" rx="10" ry="5" fill="#d9a380" opacity=".6" />
      <ellipse cx="160" cy="125" rx="10" ry="5" fill="#d9a380" opacity=".6" />
      <path d="M76 148Q98 144 120 155Q143 144 165 148V189Q141 187 120 199Q99 187 76 189Z" fill="#fffaf0" stroke="#064e3b" strokeWidth="3" strokeLinejoin="round" />
      <path d="M120 155V199M88 160L108 166M88 172L108 178M132 166L153 160M132 178L153 172" stroke="#064e3b" strokeWidth="2" strokeLinecap="round" opacity=".6" />
      <path d="M177 44V60M169 52H185M47 72V82M42 77H52" stroke="#b77920" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

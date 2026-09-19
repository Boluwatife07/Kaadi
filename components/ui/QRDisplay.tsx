// OWNER: SA
"use client";

import { Button } from "./Button";
import { Card } from "./Card";

export function QRDisplay({
  imageSrc,
  profileUrl,
  active = true,
}: {
  imageSrc: string;
  profileUrl: string;
  active?: boolean;
}) {
  return (
    <Card className="flex flex-col items-center gap-[var(--space-4)] text-center">
      {active ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageSrc} alt="Your Kaadi code" width={220} height={220} />
      ) : (
        <div className="flex h-[220px] w-[220px] items-center justify-center rounded-[var(--radius)] bg-[var(--kaadi-clay-100)] text-[var(--kaadi-ink-500)]">
          Code deactivated
        </div>
      )}
      <p className="break-all text-[var(--text-sm)] text-[var(--kaadi-ink-500)]">{profileUrl}</p>
      <a href={imageSrc} download="kaadi-code.png" className="w-full">
        <Button variant="primary" fullWidth disabled={!active}>
          Download code
        </Button>
      </a>
    </Card>
  );
}

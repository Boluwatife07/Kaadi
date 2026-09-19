// OWNER: SA
// A phone number is never rendered as plain unlinked text (Section 2.2).
// Every number gets a tappable tel: link; where it's a plausible mobile
// number, a wa.me link is rendered alongside it too.

function isPlausibleMobile(phone: string): boolean {
  const digits = phone.replace(/[^\d]/g, "");
  // Loose heuristic for the demo: 10-15 digits is a mobile-shaped number.
  return digits.length >= 10 && digits.length <= 15;
}

function waNumber(phone: string): string {
  // wa.me wants digits only, no leading +.
  return phone.replace(/[^\d]/g, "");
}

export function PhoneLink({ phone, label }: { phone: string; label?: string }) {
  const showWa = isPlausibleMobile(phone);
  return (
    <span className="inline-flex items-center gap-[var(--space-3)]">
      <a
        href={`tel:${phone}`}
        className="inline-flex min-h-[var(--tap-min)] items-center gap-1 font-medium text-[var(--kaadi-clay-700)] underline underline-offset-2"
      >
        {label ?? phone}
      </a>
      {showWa && (
        <a
          href={`https://wa.me/${waNumber(phone)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[var(--tap-min)] items-center gap-1 font-medium text-[var(--kaadi-verified-700)] underline underline-offset-2"
        >
          WhatsApp
        </a>
      )}
    </span>
  );
}

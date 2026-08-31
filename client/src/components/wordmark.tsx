import Image from "next/image";

export function Wordmark() {
  return (
    <span className="flex items-center gap-2.5">
      <Image
        src="/logo.png"
        alt="Coding Club IIT Jammu"
        width={28}
        height={28}
        className="size-7 object-contain"
      />
      <span className="font-display text-sm font-bold leading-none tracking-tight">
        Coding Club{" "}
        <span className="text-muted font-medium">/ IIT Jammu</span>
      </span>
    </span>
  );
}

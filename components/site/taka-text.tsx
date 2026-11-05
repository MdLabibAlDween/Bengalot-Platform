import { Fragment } from "react";

/** Renders the taka sign with the Bengali font while keeping surrounding copy unchanged. */
export function TakaText({ text }: { text: string }) {
  const parts = text.split("৳");
  return (
    <>
      {parts.map((part, index) => (
        <Fragment key={`${part}-${index}`}>
          {part}
          {index < parts.length - 1 && (
            <span
              lang="bn"
              style={{ fontFamily: "var(--font-hind), var(--font-jakarta), sans-serif" }}
            >
              ৳
            </span>
          )}
        </Fragment>
      ))}
    </>
  );
}

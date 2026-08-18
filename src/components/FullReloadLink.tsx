"use client";

import type { ComponentProps, MouseEvent } from "react";
import type { Route } from "next";
import Link from "next/link";

type FullReloadLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
};

export function FullReloadLink({ href, onClick, ...props }: FullReloadLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    event.preventDefault();
    window.location.assign(String(href));
  };

  return <Link href={href as Route} onClick={handleClick} {...props} />;
}

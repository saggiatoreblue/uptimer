"use client";

import LayoutBody from "@/components/LayoutBody";
import { ReactElement, ReactNode } from "react";

export default function StatusLayout({
  children,
}: Readonly<{ children: ReactNode }>): ReactElement {
  return <LayoutBody>{children}</LayoutBody>;
}

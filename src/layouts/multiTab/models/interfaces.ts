import { UnderConstruc } from "@/components/common/UnderConstruction";
import { LazyExoticComponent } from "react";

export interface tabItem {
  id: string;
  title: string;
  path: string;
  component:
    | LazyExoticComponent<() => React.ReactNode>
    | (({ desc }: UnderConstruc) => React.ReactNode);
  closable: boolean;
}

export interface menu {
  title: string;
  path: string;
  tab: string;
  onClick?: () => void;
}

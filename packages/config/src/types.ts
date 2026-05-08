import { ZodType } from "zod";
import { Icons } from "./icons";
import { HTMLAttributes, ReactNode } from "react";

declare global {
    type GenericProps = HTMLAttributes<HTMLElement>;
    type RootLayoutProps = {
        children: ReactNode;
    };

    type CFetchSafeResult<T> =
        | {
              ok: true;
              data: T;
              error: null;
          }
        | {
              ok: false;
              data: null;
              error: unknown;
          };

    type CFetchOptions<T> = RequestInit & {
        schema?: ZodType<T>;
        throwOnHTTPError?: boolean;
    };

    type SiteConfig = {
        name: string;
        description: string;
        longDescription?: string;
        category: string;
        og: {
            url: string;
            width: number;
            height: number;
        };
        developer: {
            name: string;
            url: string;
        };
        keywords: string[];
        links?: Partial<Record<keyof typeof Icons, string>>;
        contact: string;
        menu: {
            name: string;
            href: string;
            icon: keyof typeof Icons;
            isExternal?: boolean;
            isDisabled?: boolean;
        }[];
        sidebar: {
            title: string;
            url: string;
            icon: keyof typeof Icons;
            items: {
                title: string;
                url: string;
                isDisabled?: boolean;
            }[];
        }[];
    };

    type PaginationResult<T> = {
        data: T[];
        count: number;
        pages: number;
    };
}

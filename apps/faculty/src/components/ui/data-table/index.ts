import { Content } from "./content";
import { DataTable as DataTableNamespace } from "./data-table";
import { Header } from "./header";
import { Pagination } from "./pagination";

export * from "./bulk-actions";
export * from "./data-table";
export * from "./export";
export * from "./faceted-filter";
export * from "./toolbar";
export * from "./view-options";

export const DataTable = {
    ...DataTableNamespace,
    Content,
    Header,
    Pagination,
};

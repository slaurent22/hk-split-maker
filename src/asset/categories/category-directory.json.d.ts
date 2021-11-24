export interface CategoryDefinition {
    fileName: string;
    displayName: string;
    data?: {
        routeNotesURL?: string;
        searchTerms?: Array<string>;
    };
}
declare const splits: Record<string, Array<CategoryDefinition>>;
export default splits;

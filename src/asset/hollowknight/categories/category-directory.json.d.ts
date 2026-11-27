export interface CategoryDefinition {
  data?: {
    routeNotesURL?: string;
    searchTerms?: Array<string>;
  };
  displayName: string;
  fileName: string;
}
declare const splits: Record<string, Array<CategoryDefinition>>;
export default splits;

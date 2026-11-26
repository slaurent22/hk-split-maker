export interface SchemaOverridePropItem {
  oneOf: Array<unknown>;
}

export interface SchemaPropertyOptions {
  additionalProperties: boolean;
  description: string;
  type: string;
  properties: Record<string, unknown>;
}

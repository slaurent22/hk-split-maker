export interface SchemaOverridePropItem {
  oneOf: Array<unknown>;
}

export interface SchemaPropertyOptions {
  additionalProperties: boolean;
  description: string;
  properties: Record<string, unknown>;
  type: string;
}

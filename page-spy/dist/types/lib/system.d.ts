export type Category =
  | 'Element'
  | 'Javascript'
  | 'Feature'
  | 'Network'
  | 'Storage';
export interface FeatureDescriptor {
  title: string;
  keyPath?: string;
  customTest?: string;
  supported?: boolean;
}
export type Feature = Record<Category, Record<string, FeatureDescriptor>>;

export interface DataItem {
  id: string;
  system: {
    os: string;
    ua: string;
    browser: string;
  };
  features: Record<Category, FeatureDescriptor[]>;
}

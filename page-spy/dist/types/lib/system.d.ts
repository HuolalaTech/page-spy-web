import { Browser, OS } from './device';

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
    ua: string;
    osName: OS;
    osVersion: string;
    browserName: Browser;
    browserVersion: string;
  };
  features: Record<Category, FeatureDescriptor[]>;
}

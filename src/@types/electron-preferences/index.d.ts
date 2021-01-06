/// <reference types="node" />

interface Options {

}


export declare class ElectronPreferences {
  constructor(options: Options);
  dataStore: Record<string, any>;
  defaults: Record<string, any>;
  get preferences: Record<string, any>;
  set preferences: (value: Record<string, any>) => void;
  save: () => void;
  value: (key: string|Array<string>, value?: any) => void|any;
  broadcast: () => void;
  show: () => void;
}
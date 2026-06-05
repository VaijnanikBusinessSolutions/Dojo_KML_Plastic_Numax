export type Factory = {
    id: number;
    name: string;
  };
  
  export type Department = {
    id: number;
    name: string;
    factory: number;
  };
  
  export type Line = {
    id: number;
    name: string;
    department: number;
  };
  
  export type Workstation = {
    id: number;
    name: string;
    line: number;
  };
  
  export type Station = {
    id?: number;
    station_name: string;
  };
  
  export type LineStructure = {
    id?: number;
    line_name: string;
    stations: Station[];
  };
  
  export type ShopFloorStructure = {
    id?: number;
    shopfloor_name: string;
    lines: LineStructure[];
  };
  
  export type FactoryStructure = {
    id?: number;
    factory_name: string;
    shop_floors: ShopFloorStructure[];
  };
  
  export type NewItems = {
    factory: string;
    shopFloor: string;
    line: string;
    station: string;
  };
  
  export type LevelEnabled = {
    factory: boolean;
    shopFloor: boolean;
    line: boolean;
    station: boolean;
  };
  
  export type DataState = {
    factories: Factory[];
    shopFloors: Department[];
    lines: Line[];
    stations: Workstation[];
  };
  
  export type LoadingState = {
    factories: boolean;
    shopFloors: boolean;
    lines: boolean;
    stations: boolean;
    structures: boolean;
  };
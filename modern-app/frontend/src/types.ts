export type State = {
  name: string;
  abbreviation: string;
};

export type CountyFeature = {
  type: "Feature";
  properties: {
    NAME?: string;
    name?: string;
    STATE_N?: string;
    STATE_A?: string;
    [key: string]: unknown;
  };
  geometry: {
    type: string;
    coordinates: any;
  };
};

export type CountiesGeoJSON = {
  type: "FeatureCollection";
  features: CountyFeature[];
};

export type Property = {
  id?: number;
  property_nm?: string;
  address: string;
  county: string;
  acres: number;
  type?: string; // "water" or "dry"
  cost: number;
  hours_home?: number;
  miles_home?: number;
  contact_poc?: string;
  date_contactd?: string;
  website_link?: string;
  lat: number;
  long: number;
  [key: string]: unknown;
};

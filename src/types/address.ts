export const ADDRESS_TYPES = ['Home', 'Office', 'Other'] as const;

export type AddressType = (typeof ADDRESS_TYPES)[number] | string;

export type Address = {
  id: string;
  addressType: AddressType;
  name: string;
  phone?: string;
  house: string;
  street: string;
  area: string;
  landmark?: string | null;
  city: string;
  state: string;
  pincode: string;
  lat: number;
  lng: number;
  isDefault?: boolean;
};

export type AddressPayload = {
  addressType: AddressType;
  name: string;
  phone: string;
  house: string;
  street: string;
  area: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  lat: number;
  lng: number;
  isDefault?: boolean;
};

export type AddressListResponse = {
  items: Address[];
};

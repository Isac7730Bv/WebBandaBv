export interface Instrument {
  id: string;
  name: string;
  code: string;
}

export interface CreateInstrumentInput {
  name: string;
  code: string;
}

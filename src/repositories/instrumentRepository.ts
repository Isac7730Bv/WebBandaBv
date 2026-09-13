import type { CreateInstrumentInput, Instrument } from "../types/instrument";

const API_BASE = "/api";

export const instrumentRepository = {
  async getInstruments(): Promise<Instrument[]> {
    const response = await fetch(`${API_BASE}/instruments`);
    const { instruments } = (await response.json()) as { instruments: Instrument[] };
    return instruments;
  },

  async createInstrument(
    input: CreateInstrumentInput,
  ): Promise<{ instrument?: Instrument; error?: string }> {
    const response = await fetch(`${API_BASE}/instruments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    const data = (await response.json()) as { instrument?: Instrument; error?: string };

    if (!response.ok) {
      return { error: data.error ?? "No se pudo crear el instrumento." };
    }

    return { instrument: data.instrument };
  },

  async updateInstrument(
    id: string,
    input: CreateInstrumentInput,
  ): Promise<{ instrument?: Instrument; error?: string }> {
    const response = await fetch(`${API_BASE}/instruments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    const data = (await response.json()) as { instrument?: Instrument; error?: string };

    if (!response.ok) {
      return { error: data.error ?? "No se pudo actualizar el instrumento." };
    }

    return { instrument: data.instrument };
  },

  async deleteInstrument(id: string): Promise<{ ok?: boolean; error?: string }> {
    const response = await fetch(`${API_BASE}/instruments/${id}`, {
      method: "DELETE",
    });

    const data = (await response.json()) as { ok?: boolean; error?: string };

    if (!response.ok) {
      return { error: data.error ?? "No se pudo eliminar el instrumento." };
    }

    return { ok: true };
  },
};

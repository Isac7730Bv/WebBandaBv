export type AttendanceStatus = "PRESENTE" | "AUSENTE" | "LICENCIA" | "PENDIENTE";

export interface AttendanceEntry {
  date: string;
  userId: string;
  status: AttendanceStatus;
}

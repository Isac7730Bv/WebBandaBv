import type { AttendanceEntry, AttendanceStatus } from "../types/attendance";
import type { User } from "../types/auth";
import { authRepository } from "./authRepository";

const API_BASE = "/api";

export const attendanceRepository = {
  getMembers: (): Promise<User[]> => authRepository.getMembers(),

  async getAttendanceForDate(date: string): Promise<AttendanceEntry[]> {
    const response = await fetch(`${API_BASE}/attendance?date=${encodeURIComponent(date)}`);
    const { attendance } = (await response.json()) as { attendance: AttendanceEntry[] };
    return attendance;
  },

  async createDailyList(date: string): Promise<AttendanceEntry[]> {
    const response = await fetch(`${API_BASE}/attendance/daily-list`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date }),
    });

    const { attendance } = (await response.json()) as { attendance: AttendanceEntry[] };
    return attendance;
  },

  async updateAttendance(
    date: string,
    userId: string,
    status: AttendanceStatus,
  ): Promise<AttendanceEntry[]> {
    const response = await fetch(`${API_BASE}/attendance`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, userId, status }),
    });

    const { attendance } = (await response.json()) as { attendance: AttendanceEntry[] };
    return attendance;
  },

  async getAttendanceForUser(userId: string): Promise<AttendanceEntry[]> {
    const response = await fetch(`${API_BASE}/attendance/user/${userId}`);
    const { attendance } = (await response.json()) as { attendance: AttendanceEntry[] };
    return attendance;
  },
};

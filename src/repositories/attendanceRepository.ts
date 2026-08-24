import initialUsers from "../data/users.json";
import { storageService } from "../services/storageService";

import type { AttendanceEntry, AttendanceStatus } from "../types/attendance";
import type { User, UserRecord } from "../types/auth";

const ATTENDANCE_KEY = "app_attendance";
const users = initialUsers as UserRecord[];

const getStoredEntries = (): AttendanceEntry[] =>
  storageService.get<AttendanceEntry[]>(ATTENDANCE_KEY) ?? [];

const getMembers = (): User[] =>
  users
    .filter((user) => user.role === "USUARIO")
    .map(({ id, name, carnet, role }) => ({ id, name, carnet, role }));

export const attendanceRepository = {
  getMembers,

  getAttendanceForDate(date: string): AttendanceEntry[] {
    const entriesForDate = getStoredEntries().filter((entry) => entry.date === date);

    return getMembers().map((member) => (
      entriesForDate.find((entry) => entry.userId === member.id) ?? {
        date,
        userId: member.id,
        status: "PENDIENTE",
      }
    ));
  },

  createDailyList(date: string): AttendanceEntry[] {
    const storedEntries = getStoredEntries();
    const entriesForDate = this.getAttendanceForDate(date);
    const hasListForDate = storedEntries.some((entry) => entry.date === date);

    if (!hasListForDate) {
      storageService.set(ATTENDANCE_KEY, [...storedEntries, ...entriesForDate]);
    }

    return entriesForDate;
  },

  updateAttendance(date: string, userId: string, status: AttendanceStatus): AttendanceEntry[] {
    const entries = this.createDailyList(date).map((entry) =>
      entry.userId === userId ? { ...entry, status } : entry,
    );
    const entriesForOtherDays = getStoredEntries().filter((entry) => entry.date !== date);

    storageService.set(ATTENDANCE_KEY, [...entriesForOtherDays, ...entries]);

    return entries;
  },

  getAttendanceForUser(userId: string): AttendanceEntry[] {
    return getStoredEntries()
      .filter((entry) => entry.userId === userId)
      .sort((first, second) => second.date.localeCompare(first.date));
  },
};

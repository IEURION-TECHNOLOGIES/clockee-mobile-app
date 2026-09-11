// hooks/students.ts

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  // Parent
  getParentDashboard,
  getParentChildren,
  getChildAttendance,
  getChildClockHistory,
  type ChildAttendanceFilters,

  // Staff: student clocking & attendance
  getStudentsList,
  studentClockIn,
  getStudentRoster,
  bulkUpsertStudentAttendance,
  type StudentsListFilters,
  type StudentClockInPayload,
  type StudentRosterFilters,
  type BulkAttendancePayload,

  // Admin: students
  createStudent,
  bulkUploadStudents,
  getAdminStudents,
  getAdminStudentById,
  getStudentsImportTemplate,
  type CreateStudentPayload,
  type AdminStudentsFilters,
} from "@/services/superAdminServices";

/* =========================================================
   PARENT PORTAL
========================================================= */

export function useParentDashboard() {
  return useQuery({
    queryKey: ["parentDashboard"],
    queryFn: () =>
      getParentDashboard().then((r) => r.data),
  });
}

export function useParentChildren() {
  return useQuery({
    queryKey: ["parentChildren"],
    queryFn: () =>
      getParentChildren().then((r) => r.data),
  });
}

export function useChildAttendance(
  studentId: string | undefined,
  filters: ChildAttendanceFilters = {}
) {
  return useQuery({
    queryKey: [
      "childAttendance",
      studentId,
      filters,
    ],

    queryFn: () =>
      getChildAttendance(
        studentId!,
        filters
      ).then((r) => r.data),

    enabled: !!studentId,
  });
}

export function useChildClockHistory(
  studentId: string | undefined
) {
  return useQuery({
    queryKey: [
      "childClockHistory",
      studentId,
    ],

    queryFn: () =>
      getChildClockHistory(
        studentId!
      ).then((r) => r.data),

    enabled: !!studentId,
  });
}

/* =========================================================
   STAFF: STUDENT CLOCK-IN
========================================================= */

export function useStudentClockIn() {
  return useMutation({
    mutationFn: ({
      studentId,
      payload,
    }: {
      studentId: string;
      payload: StudentClockInPayload;
    }) => {
      console.log(
        "[useStudentClockIn] Student ID:",
        studentId
      );

      console.log(
        "[useStudentClockIn] Payload:",
        JSON.stringify(payload, null, 2)
      );

      return studentClockIn(
        studentId,
        payload
      ).then((response) => {
        console.log(
          "[useStudentClockIn] API response:",
          JSON.stringify(response.data, null, 2)
        );

        return response.data;
      });
    },

    onError: (error: any) => {
      console.error(
        "[useStudentClockIn] Mutation failed:",
        error
      );

      console.error(
        "[useStudentClockIn] HTTP status:",
        error?.response?.status
      );

      console.error(
        "[useStudentClockIn] Backend response:",
        error?.response?.data
      );
    },
  });
}
/* =========================================================
   STAFF: STUDENT LIST
========================================================= */

export function useStudentsList(
  filters: StudentsListFilters = {}
) {
  return useQuery({
    queryKey: [
      "studentsList",
      filters,
    ],

    queryFn: () =>
      getStudentsList(
        filters
      ).then((r) => r.data),
  });
}

/* =========================================================
   STAFF: ROSTER WITH ATTENDANCE
========================================================= */

export function useStudentRoster(
  filters: StudentRosterFilters = {}
) {
  return useQuery({
    queryKey: [
      "studentRoster",
      filters,
    ],

    queryFn: () =>
      getStudentRoster(
        filters
      ).then((r) => r.data),
  });
}

/* =========================================================
   STAFF: BULK ATTENDANCE SAVE
========================================================= */

export function useBulkUpsertStudentAttendance() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      payload: BulkAttendancePayload
    ) =>
      bulkUpsertStudentAttendance(
        payload
      ).then((r) => r.data),

    onSuccess: async () => {
      /*
       * IMPORTANT
       *
       * Attendance has changed on the backend.
       *
       * Invalidate EVERY studentRoster query.
       *
       * This includes:
       *
       * ["studentRoster", { date }]
       *
       * and any other studentRoster
       * query currently mounted.
       *
       * React Query will refetch the
       * active queries automatically.
       */
      await queryClient.invalidateQueries({
        queryKey: ["studentRoster"],
      });
    },
  });
}

/* =========================================================
   ADMIN: CREATE STUDENT
========================================================= */

export function useCreateStudent() {
  return useMutation({
    mutationFn: (
      data: CreateStudentPayload
    ) =>
      createStudent(
        data
      ).then((r) => r.data),
  });
}

/* =========================================================
   ADMIN: BULK UPLOAD STUDENTS
========================================================= */

export function useBulkUploadStudents() {
  return useMutation({
    mutationFn: (
      formData: FormData
    ) =>
      bulkUploadStudents(
        formData
      ).then((r) => r.data),
  });
}

/* =========================================================
   ADMIN: STUDENTS LIST
========================================================= */

export function useAdminStudents(
  filters: AdminStudentsFilters = {}
) {
  return useQuery({
    queryKey: [
      "adminStudents",
      filters,
    ],

    queryFn: () =>
      getAdminStudents(
        filters
      ).then((r) => r.data),
  });
}

/* =========================================================
   ADMIN: SINGLE STUDENT DETAIL
========================================================= */

export function useAdminStudentById(
  id: string | undefined
) {
  return useQuery({
    queryKey: [
      "adminStudentById",
      id,
    ],

    queryFn: () =>
      getAdminStudentById(
        id!
      ).then((r) => r.data),

    enabled: !!id,
  });
}

/* =========================================================
   ADMIN: CSV TEMPLATE
========================================================= */

export function useStudentsImportTemplate() {
  return useQuery({
    queryKey: [
      "studentsImportTemplate",
    ],

    queryFn: () =>
      getStudentsImportTemplate()
        .then((r) => r.data),
  });
}

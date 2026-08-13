import { useQuery } from "@tanstack/react-query";

export type DemoStaffAttendance = {
  status:
    | "present"
    | "late"
    | "absent"
    | "remote"
    | "onLeave"
    | "notRecorded";
  checkInTime: string | null;
  checkOutTime: string | null;
  isLate: boolean;
  isRemote: boolean;
  isOnLeave: boolean;
};

export type BranchStaff = {
  _id: string;
  name: string;
  email: string;
  avatar: string | null;
  departmentOrUnit: string;
  role: string[];
  branchId: string;
  status: "active" | "inactive";
  todayAttendance: DemoStaffAttendance;
};

const demoStaff: BranchStaff[] = [
  {
    _id: "staff_demo_001",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    avatar: null,
    departmentOrUnit: "Finance",
    role: ["staff"],
    branchId: "branch_demo_123",
    status: "active",
    todayAttendance: {
      status: "present",
      checkInTime: "2026-08-07T07:58:00.000Z",
      checkOutTime: null,
      isLate: false,
      isRemote: false,
      isOnLeave: false,
    },
  },

  {
    _id: "staff_demo_002",
    name: "David Williams",
    email: "david@example.com",
    avatar: null,
    departmentOrUnit: "IT",
    role: ["staff"],
    branchId: "branch_demo_123",
    status: "active",
    todayAttendance: {
      status: "late",
      checkInTime: "2026-08-07T09:22:00.000Z",
      checkOutTime: null,
      isLate: true,
      isRemote: false,
      isOnLeave: false,
    },
  },

  {
    _id: "staff_demo_003",
    name: "Michael Brown",
    email: "michael@example.com",
    avatar: null,
    departmentOrUnit: "Operations",
    role: ["staff"],
    branchId: "branch_demo_123",
    status: "active",
    todayAttendance: {
      status: "remote",
      checkInTime: "2026-08-07T08:20:00.000Z",
      checkOutTime: null,
      isLate: false,
      isRemote: true,
      isOnLeave: false,
    },
  },

  {
    _id: "staff_demo_004",
    name: "Grace Adams",
    email: "grace@example.com",
    avatar: null,
    departmentOrUnit: "Finance",
    role: ["staff"],
    branchId: "branch_demo_123",
    status: "active",
    todayAttendance: {
      status: "absent",
      checkInTime: null,
      checkOutTime: null,
      isLate: false,
      isRemote: false,
      isOnLeave: false,
    },
  },

  {
    _id: "staff_demo_005",
    name: "Daniel Okafor",
    email: "daniel@example.com",
    avatar: null,
    departmentOrUnit: "Human Resources",
    role: ["staff"],
    branchId: "branch_demo_123",
    status: "active",
    todayAttendance: {
      status: "onLeave",
      checkInTime: null,
      checkOutTime: null,
      isLate: false,
      isRemote: false,
      isOnLeave: true,
    },
  },

  {
    _id: "staff_demo_006",
    name: "Aisha Bello",
    email: "aisha@example.com",
    avatar: null,
    departmentOrUnit: "Customer Service",
    role: ["staff"],
    branchId: "branch_demo_123",
    status: "inactive",
    todayAttendance: {
      status: "notRecorded",
      checkInTime: null,
      checkOutTime: null,
      isLate: false,
      isRemote: false,
      isOnLeave: false,
    },
  },
];

export function useBranchStaff(
  branchId?: string | null
) {
  return useQuery({
    queryKey: ["demo-branch-staff", branchId],

    queryFn: async () => {
      /*
       * Simulate a network request.
       */
      await new Promise((resolve) =>
        setTimeout(resolve, 600)
      );

      /*
       * Return staff belonging to the selected branch.
       *
       * For demo purposes, the records are reassigned
       * to the branch ID passed into the hook.
       */
      return demoStaff.map((member) => ({
        ...member,
        branchId:
          branchId || member.branchId,
      }));
    },

    enabled: true,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
  });
}

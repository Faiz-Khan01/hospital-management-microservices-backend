package com.hospital.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminDashboardDto implements Serializable {

    private DashboardSummary summary;
    private List<TodayAppointmentDto> todayAppointments;
    private Map<String, Object> charts;
    private OpsSnapshotDto opsSnapshot;
    private List<DepartmentStatDto> appointmentsByDepartment;
    private List<FunnelStageDto> admissionsFunnel;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DashboardSummary implements Serializable {
        private long totalPatients;
        private long availableBeds;
        private long totalDoctors;
        private long totalAppointments;
        private String patientChange;
        private String doctorChange;
        private String appointmentChange;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TodayAppointmentDto implements Serializable {
        private String time;
        private String doctorName;
        private String patientName;
        private String department;
        private String status;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OpsSnapshotDto implements Serializable {
        private int admissions;
        private int discharges;
        private String bedUtilization;
        private String revenue;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DepartmentStatDto implements Serializable {
        private String name;
        private int value;
        private String color;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FunnelStageDto implements Serializable {
        private String stage;
        private int val;
        private int pct;
        private String color;
    }
}

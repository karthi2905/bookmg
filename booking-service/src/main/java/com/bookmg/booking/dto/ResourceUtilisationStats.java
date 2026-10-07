package com.bookmg.booking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResourceUtilisationStats {
    private Long resourceId;
    private String resourceName;
    private long bookingCount;
    private double totalHours;
    private double utilisationPercent;
}

package com.taskmanager.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Schema(description = "Request object for creating or updating a task")
public class TaskRequest {
    @Schema(description = "Title of the task", example = "Complete project documentation", required = true)
    private String title;
    
    @Schema(description = "Description of the task", example = "Complete the landing page with responsive design", required = false)
    private String description;
    
    @Schema(description = "Name of the person assigned to the task", example = "John Doe", required = false)
    private String assignee; // Changed from assigneeName to match frontend JSON
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    @Schema(description = "Due date and time of the task (format: yyyy-MM-dd HH:mm)", 
            example = "2025-06-30 17:00", required = false)
    private LocalDateTime dueDate;
    
    @Schema(description = "Priority of the task (P1, P2, P3, P4). Default is P3.", 
            example = "P2", allowableValues = {"P1", "P2", "P3", "P4"}, defaultValue = "P3")
    private String priority = "P3";

    private String status = "PENDING";
}

package com.taskmanager.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.taskmanager.model.Task;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Schema(description = "Response object containing task details")
public class TaskResponse {
    @Schema(description = "Unique identifier of the task", example = "1")
    private Long id;
    
    @Schema(description = "Title of the task (truncated from description)", example = "Complete project documentation")
    private String title;
    
    @Schema(description = "Full description of the task", example = "Complete project documentation by Friday")
    private String description;
    
    @Schema(description = "Name of the person assigned to the task", example = "John Doe")
    private String assigneeName;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    @Schema(description = "Due date and time of the task", example = "2025-06-30 17:00")
    private LocalDateTime dueDate;
    
    @Schema(description = "Priority of the task (P1, P2, P3, P4)", example = "P2")
    private String priority;
    
    @Schema(description = "Current status of the task", example = "PENDING")
    private String status;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    @Schema(description = "Date and time when the task was created", example = "2025-05-29 10:30:00")
    private LocalDateTime createdAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    @Schema(description = "Date and time when the task was last updated", example = "2025-05-29 14:45:00")
    private LocalDateTime updatedAt;
    
    public static TaskResponse fromEntity(Task task) {
        TaskResponse response = new TaskResponse();
        response.setId(task.getId());
        response.setTitle(task.getTitle());
        response.setDescription(task.getDescription());
        response.setAssigneeName(task.getAssigneeName());
        response.setDueDate(task.getDueDate());
        response.setPriority(task.getPriority());
        response.setStatus(task.getStatus());
        response.setCreatedAt(task.getCreatedAt());
        response.setUpdatedAt(task.getUpdatedAt());
        return response;
    }
}

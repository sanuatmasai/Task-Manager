package com.taskmanager.controller;

import com.taskmanager.dto.MeetingMinutesRequest;
import com.taskmanager.dto.TaskRequest;
import com.taskmanager.dto.TaskResponse;
import com.taskmanager.service.GeminiService;
import com.taskmanager.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@Tag(name = "Task Management", description = "APIs for managing tasks with natural language processing")
public class TaskController {

    private final TaskService taskService;
    private final GeminiService geminiService;

    @Operation(summary = "Create a new task", description = "Creates a new task with the provided details")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Task created successfully",
                    content = @Content(schema = @Schema(implementation = TaskResponse.class))),
        @ApiResponse(responseCode = "400", description = "Invalid input")
    })
    @PostMapping(produces = MediaType.APPLICATION_JSON_VALUE, consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<TaskResponse> createTask(
            @Parameter(description = "Task details to be created", required = true)
            @Valid @RequestBody TaskRequest taskRequest) {
        TaskResponse response = taskService.createTask(taskRequest);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @Operation(summary = "Create task from natural language", 
               description = "Creates a task by parsing natural language input")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Task created successfully",
                   content = @Content(schema = @Schema(implementation = TaskResponse.class))),
        @ApiResponse(responseCode = "400", description = "Invalid input")
    })
    @PostMapping(value = "/parse", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<TaskResponse> createTaskFromNaturalLanguage(
            @Parameter(description = "Natural language description of the task (e.g., 'Finish project by tomorrow 5pm')", 
                     required = true, 
                     example = "Finish landing page by Aman at 11pm 20th June")
            @RequestParam("text") String naturalLanguageInput) {
        TaskResponse response = taskService.createTaskFromNaturalLanguage(naturalLanguageInput);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @Operation(summary = "Parse meeting minutes and extract tasks", 
               description = "Extracts tasks from meeting minutes using AI")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Tasks extracted successfully",
                   content = @Content(schema = @Schema(implementation = TaskResponse[].class))),
        @ApiResponse(responseCode = "400", description = "Invalid input")
    })
    @PostMapping(value = "/meeting-minutes", produces = MediaType.APPLICATION_JSON_VALUE, consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<TaskResponse>> parseMeetingMinutes(
            @Parameter(description = "Meeting minutes text", required = true)
            @Valid @RequestBody MeetingMinutesRequest request) {
        List<TaskRequest> taskRequests = geminiService.parseMeetingMinutes(request.getTranscript());
        List<TaskResponse> responses = taskRequests.stream()
            .map(taskService::createTask)
            .toList();
        return ResponseEntity.ok(responses);
    }

    @Operation(summary = "Get all tasks with pagination and search", description = "Retrieves a paginated list of tasks with optional search")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved paginated list of tasks")
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> getAllTasks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search) {
        
        Map<String, Object> response = taskService.getAllTasks(page, size, search);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get task by ID", description = "Retrieves a specific task by its ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved task",
                   content = @Content(schema = @Schema(implementation = TaskResponse.class))),
        @ApiResponse(responseCode = "404", description = "Task not found")
    })
    @GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<TaskResponse> getTaskById(
            @Parameter(description = "ID of the task to be retrieved", required = true, example = "1")
            @PathVariable Long id) {
        TaskResponse task = taskService.getTaskById(id);
        return ResponseEntity.ok(task);
    }

    @Operation(summary = "Update a task", description = "Updates an existing task with the provided details")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Task updated successfully",
                   content = @Content(schema = @Schema(implementation = TaskResponse.class))),
        @ApiResponse(responseCode = "400", description = "Invalid input"),
        @ApiResponse(responseCode = "404", description = "Task not found")
    })
    @PutMapping(value = "/{id}", 
               produces = MediaType.APPLICATION_JSON_VALUE, 
               consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<TaskResponse> updateTask(
            @Parameter(description = "ID of the task to be updated", required = true, example = "1")
            @PathVariable Long id, 
            @Parameter(description = "Updated task details", required = true)
            @Valid @RequestBody TaskRequest taskRequest) {
        TaskResponse response = taskService.updateTask(id, taskRequest);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Delete a task", description = "Deletes a specific task by its ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Task deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Task not found")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(
            @Parameter(description = "ID of the task to be deleted", required = true, example = "1")
            @PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Get tasks by assignee", description = "Retrieves all tasks assigned to a specific person")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved tasks",
                content = @Content(schema = @Schema(implementation = TaskResponse.class, type = "array")))
    @GetMapping(value = "/assignee/{assigneeName}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<TaskResponse>> getTasksByAssignee(
            @Parameter(description = "Name of the assignee", required = true, example = "Aman")
            @PathVariable String assigneeName) {
        List<TaskResponse> tasks = taskService.getTasksByAssignee(assigneeName);
        return ResponseEntity.ok(tasks);
    }

    @Operation(summary = "Get tasks by priority", description = "Retrieves all tasks with a specific priority (P1, P2, P3, P4)")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved tasks",
                content = @Content(schema = @Schema(implementation = TaskResponse.class, type = "array")))
    @GetMapping(value = "/priority/{priority}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<TaskResponse>> getTasksByPriority(
            @Parameter(description = "Priority level (P1, P2, P3, P4)", required = true, example = "P1")
            @PathVariable String priority) {
        List<TaskResponse> tasks = taskService.getTasksByPriority(priority);
        return ResponseEntity.ok(tasks);
    }

    @Operation(summary = "Get tasks by status", description = "Retrieves all tasks with a specific status")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved tasks",
                content = @Content(schema = @Schema(implementation = TaskResponse.class, type = "array")))
    @GetMapping(value = "/status/{status}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<TaskResponse>> getTasksByStatus(
            @Parameter(description = "Status of the tasks (e.g., PENDING, IN_PROGRESS, COMPLETED)", 
                      required = true, 
                      example = "PENDING")
            @PathVariable String status) {
        List<TaskResponse> tasks = taskService.getTasksByStatus(status);
        return ResponseEntity.ok(tasks);
    }
}

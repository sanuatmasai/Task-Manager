package com.taskmanager.service;

import com.taskmanager.dto.TaskRequest;
import com.taskmanager.dto.TaskResponse;
import com.taskmanager.model.Task;
import com.taskmanager.repository.TaskRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {
    
    private final TaskRepository taskRepository;
    private final NLParserService nlParserService;
    
    @Transactional
    public TaskResponse createTask(TaskRequest taskRequest) {
        Task task = new Task();
        updateTaskFromRequest(task, taskRequest);
        task = taskRepository.save(task);
        return TaskResponse.fromEntity(task);
    }
    
    @Transactional
    public TaskResponse createTaskFromNaturalLanguage(String naturalLanguageInput) {
        TaskRequest taskRequest = nlParserService.parseTaskDescription(naturalLanguageInput);
        return createTask(taskRequest);
    }
    
    @Transactional(readOnly = true)
    public List<TaskResponse> getAllTasks() {
        return taskRepository.findAll().stream()
            .map(TaskResponse::fromEntity)
            .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public TaskResponse getTaskById(Long id) {
        Task task = taskRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Task not found with id: " + id));
        return TaskResponse.fromEntity(task);
    }
    
    @Transactional
    public TaskResponse updateTask(Long id, TaskRequest taskRequest) {
        Task task = taskRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Task not found with id: " + id));
        
        updateTaskFromRequest(task, taskRequest);
        task = taskRepository.save(task);
        return TaskResponse.fromEntity(task);
    }
    
    @Transactional
    public void deleteTask(Long id) {
        if (!taskRepository.existsById(id)) {
            throw new EntityNotFoundException("Task not found with id: " + id);
        }
        taskRepository.deleteById(id);
    }
    
    @Transactional(readOnly = true)
    public List<TaskResponse> getTasksByAssignee(String assigneeName) {
        return taskRepository.findByAssigneeNameIgnoreCase(assigneeName).stream()
            .map(TaskResponse::fromEntity)
            .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<TaskResponse> getTasksByPriority(String priority) {
        return taskRepository.findByPriority(priority.toUpperCase()).stream()
            .map(TaskResponse::fromEntity)
            .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<TaskResponse> getTasksByStatus(String status) {
        return taskRepository.findByStatus(status.toUpperCase()).stream()
            .map(TaskResponse::fromEntity)
            .collect(Collectors.toList());
    }
    
    private void updateTaskFromRequest(Task task, TaskRequest request) {
        task.setTitle(request.getTitle() == null ? truncate(request.getDescription(), 500) : request.getTitle());
        task.setDescription(request.getDescription());
        task.setAssigneeName(request.getAssigneeName());
        task.setDueDate(request.getDueDate());
        task.setStatus(request.getStatus().toUpperCase());
        task.setPriority(request.getPriority().toUpperCase());
    }
    
    private String truncate(String value, int maxLength) {
        if (value == null) {
            return null;
        }
        return value.length() > maxLength ? value.substring(0, maxLength) : value;
    }
}

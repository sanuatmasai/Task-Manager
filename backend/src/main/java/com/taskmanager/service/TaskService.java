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
    public Map<String, Object> getAllTasks(int page, int size, String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("dueDate").ascending());
        
        Specification<Task> spec = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            if (search != null && !search.trim().isEmpty()) {
                String searchTerm = "%" + search.toLowerCase() + "%";
                Predicate titlePredicate = criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("title")), searchTerm);
                Predicate descPredicate = criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("description")), searchTerm);
                Predicate assigneePredicate = criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("assignee")), searchTerm);
                predicates.add(criteriaBuilder.or(titlePredicate, descPredicate, assigneePredicate));
            }
            
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
        
        Page<Task> taskPage = taskRepository.findAll(spec, pageable);
        
        Map<String, Object> response = new HashMap<>();
        response.put("tasks", taskPage.getContent().stream()
            .map(TaskResponse::fromEntity)
            .collect(Collectors.toList()));
        response.put("currentPage", taskPage.getNumber());
        response.put("totalItems", taskPage.getTotalElements());
        response.put("totalPages", taskPage.getTotalPages());
        
        return response;
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
    public List<TaskResponse> getTasksByAssignee(String assignee) {
        return taskRepository.findByAssigneeIgnoreCase(assignee).stream()
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
        if (request.getTitle() != null) {
            task.setTitle(truncate(request.getTitle(), 500));
        } else if (request.getDescription() != null) {
            task.setTitle(truncate(request.getDescription(), 500));
        }
        
        if (request.getDescription() != null) {
            task.setDescription(request.getDescription());
        }
        
        if (request.getAssignee() != null) {
            task.setAssignee(request.getAssignee());
        }
        
        if (request.getDueDate() != null) {
            task.setDueDate(request.getDueDate());
        }
        
        if (request.getStatus() != null) {
            task.setStatus(request.getStatus().toUpperCase());
        }
        
        if (request.getPriority() != null) {
            task.setPriority(request.getPriority().toUpperCase());
        } else {
            task.setPriority("P3"); // Default priority
        }
    }
    
    private String truncate(String value, int maxLength) {
        if (value == null) {
            return null;
        }
        return value.length() > maxLength ? value.substring(0, maxLength) : value;
    }
}

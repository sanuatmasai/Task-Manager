package com.taskmanager.repository;

import com.taskmanager.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByAssigneeNameIgnoreCase(String assigneeName);
    List<Task> findByStatus(String status);
    List<Task> findByPriority(String priority);
}

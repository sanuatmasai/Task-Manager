package com.taskmanager.service;

import com.joestelmach.natty.DateGroup;
import com.joestelmach.natty.Parser;
import com.taskmanager.dto.TaskRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class NLParserService {
    
    private static final Pattern ASSIGNEE_PATTERN = Pattern.compile(
        "(?:to|for|assign to|assigned to|@)\\s*([A-Za-z]+(?:\\s+[A-Za-z]+)*)", 
        Pattern.CASE_INSENSITIVE
    );
    
    private static final Pattern PRIORITY_PATTERN = Pattern.compile(
        "\\b(P[1-4]|high|medium|low|urgent|asap)\\b", 
        Pattern.CASE_INSENSITIVE
    );
    
    public TaskRequest parseTaskDescription(String description) {
        TaskRequest taskRequest = new TaskRequest();
        
        // Extract assignee
        String assignee = extractAssignee(description);
        if (assignee != null) {
            taskRequest.setAssignee(assignee);
            // Remove assignee from description
            description = description.replaceAll(
                "(?:to|for|assign to|assigned to|@)\\s*" + Pattern.quote(assignee), 
                ""
            ).trim();
        }
        
        // Extract priority
        String priority = extractPriority(description);
        if (priority != null) {
            taskRequest.setPriority(priority);
            // Remove priority from description
            description = description.replaceAll(
                "\\b" + Pattern.quote(priority) + "\\b", 
                ""
            ).trim();
        }
        
        // Extract dates
        LocalDateTime dueDate = extractDate(description);
        if (dueDate != null) {
            taskRequest.setDueDate(dueDate);
            // Remove date text from description
            Parser parser = new Parser();
            List<DateGroup> groups = parser.parse(description);
            if (!groups.isEmpty()) {
                String dateText = groups.get(0).getText();
                description = description.replace(dateText, "").trim();
            }
        }
        
        // Clean up description
        description = description
            .replaceAll("\\s+", " ")  // Replace multiple spaces with single space
            .replaceAll("\\s*,\\s*", ", ")  // Fix spacing around commas
            .replaceAll("^\\s*[,\\.]\\s*|\\s*[,\\.]\\s*$", "")  // Remove leading/trailing commas/periods
            .trim();
            
        taskRequest.setDescription(description);
        
        return taskRequest;
    }
    
    private String extractAssignee(String text) {
        Matcher matcher = ASSIGNEE_PATTERN.matcher(text);
        if (matcher.find()) {
            return matcher.group(1).trim();
        }
        return null;
    }
    
    private String extractPriority(String text) {
        Matcher matcher = PRIORITY_PATTERN.matcher(text);
        if (matcher.find()) {
            String priority = matcher.group(1).toUpperCase();
            // Convert text priorities to P1-P4 format
            switch (priority.toLowerCase()) {
                case "urgent":
                case "asap":
                case "high":
                    return "P1";
                case "important":
                case "medium":
                    return "P2";
                case "low":
                    return "P4";
                default:
                    return priority;
            }
        }
        return null;
    }
    
    private LocalDateTime extractDate(String text) {
        Parser parser = new Parser();
        List<DateGroup> groups = parser.parse(text);
        
        if (!groups.isEmpty()) {
            List<Date> dates = groups.get(0).getDates();
            if (!dates.isEmpty()) {
                return dates.get(0).toInstant()
                    .atZone(ZoneId.systemDefault())
                    .toLocalDateTime();
            }
        }
        return null;
    }
}

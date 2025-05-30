package com.taskmanager.service;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.reflect.TypeToken;
import com.taskmanager.dto.TaskRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.*;
import java.time.format.*;
import java.util.*;

@Service
public class GeminiService {
    private static final Gson GSON = new Gson();
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
    
    private LocalDateTime parseRelativeDate(String dateStr) {
        if (dateStr == null || dateStr.isEmpty()) {
            return null;
        }
        
        dateStr = dateStr.toLowerCase().trim();
        LocalDateTime now = LocalDateTime.now();
        
        try {
            // Try to parse as a full date-time string first
            return LocalDateTime.parse(dateStr, DATE_TIME_FORMATTER);
        } catch (Exception e) {
            // Not a full date-time string, continue with relative parsing
        }
        
        // Handle relative dates
        if (dateStr.contains("tonight")) {
            return now.toLocalDate().atTime(20, 0); // 8 PM today
        } else if (dateStr.contains("tomorrow")) {
            // Check for specific time like "tomorrow 10pm"
            if (dateStr.matches(".*\\d+.*")) {
                return parseTimeWithOffset(dateStr, 1);
            }
            return now.plusDays(1).toLocalDate().atTime(18, 0); // 6 PM tomorrow
        } else if (dateStr.matches("next\\s+.*day")) {
            // Handle "next monday", "next tuesday", etc.
            return parseNextDayOfWeek(dateStr);
        } else if (dateStr.matches(".*\\d+.*")) {
            // Handle time strings like "10pm", "5:30pm"
            return parseTimeWithOffset(dateStr, 0);
        }
        
        // Default to end of today if no pattern matches
        return now.toLocalDate().atTime(23, 59);
    }
    
    private LocalDateTime parseTimeWithOffset(String timeStr, int daysOffset) {
        LocalDateTime now = LocalDateTime.now().plusDays(daysOffset);
        try {
            // Handle 12-hour format (e.g., 10pm, 5:30pm)
            timeStr = timeStr.replaceAll("(?i)(\\d+)(?::(\\d+))?\s*([ap]m)?", "$1:$2 $3")
                           .replaceAll("\\s+", " ")
                           .trim();
            
            // Parse just the time
            LocalTime time = LocalTime.parse(
                timeStr.replaceAll("(?i)(\\d+)(?::(\\d+))?\s*([ap]m)?", "$1:$2 $3"),
                DateTimeFormatter.ofPattern("h:m a").withLocale(Locale.US)
            );
            return now.toLocalDate().atTime(time);
        } catch (Exception e) {
            return now.toLocalDate().atTime(18, 0); // Default to 6 PM
        }
    }
    
    private LocalDateTime parseNextDayOfWeek(String dayStr) {
        DayOfWeek targetDay = null;
        String lowerDay = dayStr.toLowerCase();
        
        if (lowerDay.contains("mon")) targetDay = DayOfWeek.MONDAY;
        else if (lowerDay.contains("tue")) targetDay = DayOfWeek.TUESDAY;
        else if (lowerDay.contains("wed")) targetDay = DayOfWeek.WEDNESDAY;
        else if (lowerDay.contains("thu")) targetDay = DayOfWeek.THURSDAY;
        else if (lowerDay.contains("fri")) targetDay = DayOfWeek.FRIDAY;
        else if (lowerDay.contains("sat")) targetDay = DayOfWeek.SATURDAY;
        else if (lowerDay.contains("sun")) targetDay = DayOfWeek.SUNDAY;
        
        if (targetDay != null) {
            LocalDate nextDate = LocalDate.now();
            while (nextDate.getDayOfWeek() != targetDay) {
                nextDate = nextDate.plusDays(1);
            }
            return nextDate.atTime(18, 0); // 6 PM on the target day
        }
        
        return LocalDateTime.now().plusDays(7).toLocalDate().atTime(18, 0); // Default to next week same day
    }

    @Value("${google.cloud.project-id}")
    private String projectId;

    @Value("${google.cloud.location}")
    private String location;

    @Value("${google.api.key}")
    private String apiKey;

    @Value("${gemini.model}")
    private String modelName;

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
    
    public List<TaskRequest> parseMeetingMinutes(String transcript) {
        try {
            // Prepare the request headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
            
            // Prepare the prompt
            String prompt = """
                Extract tasks from the following meeting transcript in JSON format. 
                For each task, include: title, description, assignee, and dueDate.
                Set default priority to P3 if not specified.
                Format dates as "yyyy-MM-dd HH:mm" or relative terms like "tonight", "tomorrow", "next week".
                
                Example output format:
                [
                  {
                    "title": "Complete the landing page",
                    "description": "Finish the landing page with responsive design",
                    "assignee": "Aman",
                    "dueDate": "2023-12-01 18:00",
                    "priority": "P3"
                  }
                ]
                
                Transcript: """ + transcript;
                
            // Prepare the request body
            JsonObject textPart = new JsonObject();
            textPart.addProperty("text", prompt);
            
            JsonObject content = new JsonObject();
            content.add("parts", new JsonArray());
            content.getAsJsonArray("parts").add(textPart);
            
            // Create safety settings array
            JsonArray safetySettings = new JsonArray();
            JsonObject safetySetting = new JsonObject();
            safetySetting.addProperty("category", "HARM_CATEGORY_DANGEROUS_CONTENT");
            safetySetting.addProperty("threshold", "BLOCK_NONE");
            safetySettings.add(safetySetting);
            
            // Create generation config
            JsonObject generationConfig = new JsonObject();
            generationConfig.addProperty("temperature", 0.7);
            generationConfig.addProperty("topP", 0.8);
            generationConfig.addProperty("topK", 40);
            
            // Create the main request body
            JsonObject requestBody = new JsonObject();
            requestBody.add("contents", new JsonArray());
            requestBody.getAsJsonArray("contents").add(content);
            requestBody.add("safetySettings", safetySettings);
            requestBody.add("generationConfig", generationConfig);
            
            // Make the API request
            String url = String.format("%s?key=%s", GEMINI_API_URL, apiKey);
            HttpEntity<String> request = new HttpEntity<>(requestBody.toString(), headers);
            
            ResponseEntity<String> response = restTemplate.exchange(
                url, 
                HttpMethod.POST, 
                request, 
                String.class
            );
            
            if (response.getStatusCode() != HttpStatus.OK) {
                throw new RuntimeException("Failed to call Gemini API: " + response.getBody());
            }
            
            // Parse the response
            String jsonResponse = response.getBody();
            JsonObject jsonObject = GSON.fromJson(jsonResponse, JsonObject.class);
            
            if (!jsonObject.has("candidates") || jsonObject.getAsJsonArray("candidates").isEmpty()) {
                throw new RuntimeException("No response from Gemini API: " + jsonResponse);
            }
            
            // Extract the text response
            String responseText = jsonObject.getAsJsonArray("candidates")
                .get(0).getAsJsonObject()
                .getAsJsonObject("content")
                .getAsJsonArray("parts")
                .get(0).getAsJsonObject()
                .get("text").getAsString();
                
            // Clean up the response to ensure it's valid JSON
            responseText = responseText.replaceAll("```(?:json)?", "")
                                    .replaceAll("```", "")
                                    .replaceFirst("^\\s*\\[", "[")
                                    .replaceFirst("\\s*\\]\\s*$", "]")
                                    .replaceAll("\\R", " ")
                                    .replaceAll("\\s*,\\s*", ",")
                                    .replaceAll("\\s*:\\s*", ":")
                                    .trim();
            
            // Parse the JSON response
            List<TaskRequest> tasks = new ArrayList<>();
            try {
                // First, try to parse as a JSON array
                JsonArray jsonArray = JsonParser.parseString(responseText).getAsJsonArray();
                for (int i = 0; i < jsonArray.size(); i++) {
                    JsonObject taskObj = jsonArray.get(i).getAsJsonObject();
                    TaskRequest task = new TaskRequest();
                    
                    // Set task properties from JSON
                    if (taskObj.has("title")) {
                        task.setTitle(taskObj.get("title").getAsString());
                    }
                    if (taskObj.has("description")) {
                        task.setDescription(taskObj.get("description").getAsString());
                    }
                    if (taskObj.has("assignee")) {
                        task.setAssignee(taskObj.get("assignee").getAsString());
                    }
                    if (taskObj.has("dueDate")) {
                        String dueDateStr = taskObj.get("dueDate").getAsString();
                        // Parse relative dates (today, tomorrow, etc.)
                        LocalDateTime dueDate = parseRelativeDate(dueDateStr);
                        task.setDueDate(dueDate);
                    }
                    if (taskObj.has("priority")) {
                        task.setPriority(taskObj.get("priority").getAsString());
                    } else {
                        task.setPriority("P3"); // Default priority
                    }
                    task.setStatus("PENDING"); // Default status
                    
                    tasks.add(task);
                }
            } catch (Exception e) {
                throw new RuntimeException("Failed to parse response: " + responseText, e);
            }
            
            if (tasks == null) {
                throw new RuntimeException("Failed to parse tasks from the response");
            }
            
            // Set default values if not provided
            for (TaskRequest task : tasks) {
                if (task.getPriority() == null) {
                    task.setPriority("P3");
                }
                if (task.getStatus() == null) {
                    task.setStatus("PENDING");
                }
            }
            
            return tasks;
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse meeting minutes: " + e.getMessage(), e);
        }
    }
}

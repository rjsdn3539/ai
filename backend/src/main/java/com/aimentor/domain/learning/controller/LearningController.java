package com.aimentor.domain.learning.controller;

import com.aimentor.common.api.ApiResponse;
import com.aimentor.external.ai.AiIntegrationProperties;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/learning")
public class LearningController {

    private final RestTemplate restTemplate;
    private final String aiBaseUrl;

    public LearningController(AiIntegrationProperties properties) {
        this.restTemplate = new RestTemplate();
        this.aiBaseUrl = properties.baseUrl();
    }

    @PostMapping("/generate")
    public ApiResponse<ProblemsResponse> generate(@RequestBody GenerateRequest request) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = Map.of(
                "subject", request.subject(),
                "difficulty", request.difficulty(),
                "count", request.count(),
                "type", request.type() != null ? request.type() : "MIX"
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
        ProblemsResponse response = restTemplate.postForObject(
                aiBaseUrl + "/learning/generate", entity, ProblemsResponse.class);
        return ApiResponse.success(response);
    }

    @PostMapping("/attempts")
    public ApiResponse<GradeResponse> attempt(@RequestBody GradeRequest request) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = Map.of(
                "question", request.question(),
                "correctAnswer", request.correctAnswer(),
                "userAnswer", request.userAnswer(),
                "explanation", request.explanation()
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
        GradeResponse response = restTemplate.postForObject(
                aiBaseUrl + "/learning/grade", entity, GradeResponse.class);
        return ApiResponse.success(response);
    }

    @PostMapping("/placement/generate")
    public ApiResponse<PlacementResponse> placementGenerate(@RequestBody PlacementGenerateRequest request) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = Map.of("count", request.count());

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
        PlacementResponse response = restTemplate.postForObject(
                aiBaseUrl + "/learning/placement/generate", entity, PlacementResponse.class);
        return ApiResponse.success(response);
    }

    @GetMapping("/stats")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.success(Map.of("totalAttempts", 0, "correctRate", 0.0));
    }

    @PostMapping("/hint")
    public ApiResponse<HintResponse> hint(@RequestBody HintRequest request) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = Map.of(
                "question", request.question(),
                "choices", request.choices(),
                "subject", request.subject() != null ? request.subject() : "",
                "difficulty", request.difficulty() != null ? request.difficulty() : "MEDIUM"
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
        HintResponse response = restTemplate.postForObject(
                aiBaseUrl + "/learning/hint", entity, HintResponse.class);
        return ApiResponse.success(response);
    }

    record GenerateRequest(String subject, String difficulty, int count, String type) {}
    record Problem(String type, String question, List<String> choices, String answer, String explanation) {}
    record ProblemsResponse(List<Problem> problems) {}
    record GradeRequest(String question, String correctAnswer, String userAnswer, String explanation) {}
    record GradeResponse(boolean isCorrect, String aiFeedback) {}
    record HintRequest(String question, List<String> choices, String subject, String difficulty) {}
    record HintResponse(String hint) {}
    record PlacementGenerateRequest(int count) {}
    record PlacementProblem(String subject, int level, String question, List<String> choices, String answer) {}
    record PlacementResponse(List<PlacementProblem> problems) {}
}

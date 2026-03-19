package com.aimentor.domain.subscription;

import com.aimentor.common.api.ApiResponse;
import com.aimentor.common.security.AuthenticatedUser;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/subscription")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    public SubscriptionController(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<SubscriptionStatusResponse>> getMyStatus(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser) {
        SubscriptionStatusResponse status = subscriptionService.getMyStatus(authenticatedUser.userId());
        return ResponseEntity.ok(ApiResponse.success(status));
    }

    record UpgradeRequest(String tier, String billing) {}

    @PostMapping("/upgrade")
    public ResponseEntity<ApiResponse<Void>> upgrade(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @RequestBody UpgradeRequest request) {
        SubscriptionTier tier = SubscriptionTier.valueOf(request.tier().toUpperCase());
        int months = "yearly".equals(request.billing()) ? 12 : 1;
        subscriptionService.changeSubscription(authenticatedUser.userId(), tier, months);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}

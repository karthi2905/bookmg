package com.bookmg.core.strategy;

import com.bookmg.core.model.Resource;

/**
 * Context / Factory selector for dynamically resolving the appropriate ApprovalStrategy.
 */
public class ApprovalPolicyEngine {
    private static final ApprovalStrategy AUTO_STRATEGY = new AutoApprovalStrategy();
    private static final ApprovalStrategy MANAGER_STRATEGY = new ManagerApprovalStrategy();

    /**
     * Resolves the strategy based on the target resource restriction flag.
     *
     * @param resource target resource to inspect
     * @return {@link ManagerApprovalStrategy} if restricted, else {@link AutoApprovalStrategy}
     */
    public static ApprovalStrategy resolveStrategy(Resource resource) {
        if (resource != null && resource.isRestricted()) {
            return MANAGER_STRATEGY;
        }
        return AUTO_STRATEGY;
    }
}

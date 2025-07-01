// Analytics utility for prompt optimization tracking
export interface PromptAnalytics {
  date: string;
  prompt_version: 'ORIGINAL' | 'OPTIMIZED';
  request_type: 'character_creation' | 'chat';
  total_requests: number;
  avg_tokens: number;
  total_tokens: number;
  avg_prompt_tokens: number;
  avg_completion_tokens: number;
  cost_estimate: number; // Rough estimate based on token usage
}

// Simple in-memory analytics (you can replace with database/external service)
class PromptAnalyticsTracker {
  private data: Map<string, PromptAnalytics> = new Map();

  private getKey(date: string, version: string, type: string): string {
    return `${date}_${version}_${type}`;
  }

  addUsage(usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    prompt_version: 'ORIGINAL' | 'OPTIMIZED';
    request_type: 'character_creation' | 'chat';
  }) {
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const key = this.getKey(date, usage.prompt_version, usage.request_type);
    
    const existing = this.data.get(key);
    if (existing) {
      // Update existing record
      const newRequests = existing.total_requests + 1;
      this.data.set(key, {
        ...existing,
        total_requests: newRequests,
        total_tokens: existing.total_tokens + usage.total_tokens,
        avg_tokens: Math.round((existing.total_tokens + usage.total_tokens) / newRequests),
        avg_prompt_tokens: Math.round(
          (existing.avg_prompt_tokens * existing.total_requests + usage.prompt_tokens) / newRequests
        ),
        avg_completion_tokens: Math.round(
          (existing.avg_completion_tokens * existing.total_requests + usage.completion_tokens) / newRequests
        ),
        cost_estimate: this.calculateCost(existing.total_tokens + usage.total_tokens),
      });
    } else {
      // Create new record
      this.data.set(key, {
        date,
        prompt_version: usage.prompt_version,
        request_type: usage.request_type,
        total_requests: 1,
        avg_tokens: usage.total_tokens,
        total_tokens: usage.total_tokens,
        avg_prompt_tokens: usage.prompt_tokens,
        avg_completion_tokens: usage.completion_tokens,
        cost_estimate: this.calculateCost(usage.total_tokens),
      });
    }
  }

  private calculateCost(totalTokens: number): number {
    // Rough estimate for DeepSeek pricing (adjust based on actual pricing)
    // This is just for comparison purposes
    const costPerMillionTokens = 0.14; // Example pricing
    return (totalTokens / 1000000) * costPerMillionTokens;
  }

  getAnalytics(days: number = 7): PromptAnalytics[] {
    const result: PromptAnalytics[] = [];
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    for (const [_, analytics] of this.data) {
      if (new Date(analytics.date) >= cutoffDate) {
        result.push(analytics);
      }
    }
    
    return result.sort((a, b) => a.date.localeCompare(b.date));
  }

  getSummary(days: number = 7): {
    original: { requests: number; tokens: number; cost: number };
    optimized: { requests: number; tokens: number; cost: number };
    savings: { tokens: number; percentage: number; cost: number };
  } {
    const analytics = this.getAnalytics(days);
    
    const original = analytics
      .filter(a => a.prompt_version === 'ORIGINAL')
      .reduce(
        (acc, a) => ({
          requests: acc.requests + a.total_requests,
          tokens: acc.tokens + a.total_tokens,
          cost: acc.cost + a.cost_estimate,
        }),
        { requests: 0, tokens: 0, cost: 0 }
      );

    const optimized = analytics
      .filter(a => a.prompt_version === 'OPTIMIZED')
      .reduce(
        (acc, a) => ({
          requests: acc.requests + a.total_requests,
          tokens: acc.tokens + a.total_tokens,
          cost: acc.cost + a.cost_estimate,
        }),
        { requests: 0, tokens: 0, cost: 0 }
      );

    const totalTokens = original.tokens + optimized.tokens;
    const totalRequests = original.requests + optimized.requests;
    
    // Calculate what would have been used if all requests used original prompts
    const avgOriginalTokens = original.requests > 0 ? original.tokens / original.requests : 0;
    const projectedOriginalTokens = totalRequests * avgOriginalTokens;
    
    const tokenSavings = projectedOriginalTokens - totalTokens;
    const percentageSavings = projectedOriginalTokens > 0 ? (tokenSavings / projectedOriginalTokens) * 100 : 0;
    const costSavings = original.cost + optimized.cost - (projectedOriginalTokens * this.calculateCost(1));

    return {
      original,
      optimized,
      savings: {
        tokens: Math.round(tokenSavings),
        percentage: Math.round(percentageSavings * 100) / 100,
        cost: Math.round(costSavings * 10000) / 10000,
      },
    };
  }

  exportData(): PromptAnalytics[] {
    return Array.from(this.data.values());
  }

  reset() {
    this.data.clear();
  }
}

// Global instance
export const analyticsTracker = new PromptAnalyticsTracker();

// Helper function to format analytics for display
export function formatAnalytics(analytics: PromptAnalytics[]): string {
  if (analytics.length === 0) return "No data available";
  
  const lines = ["Date\tVersion\tType\tRequests\tAvg Tokens\tCost Est."];
  
  analytics.forEach(a => {
    lines.push(
      `${a.date}\t${a.prompt_version}\t${a.request_type}\t${a.total_requests}\t${a.avg_tokens}\t$${a.cost_estimate.toFixed(4)}`
    );
  });
  
  return lines.join('\n');
}
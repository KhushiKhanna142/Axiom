declare module 'opossum' {
  interface CircuitBreakerOptions {
    timeout?: number;
    errorThresholdPercentage?: number;
    resetTimeout?: number;
    volumeThreshold?: number;
  }

  class CircuitBreaker<T extends (...args: any[]) => any = (...args: any[]) => any> {
    constructor(action: T, options?: CircuitBreakerOptions);
    fire(...args: Parameters<T>): Promise<ReturnType<T>>;
    on(event: string, callback: (...args: any[]) => void): this;
  }

  export = CircuitBreaker;
}

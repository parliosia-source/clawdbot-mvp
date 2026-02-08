import { randomUUID } from "node:crypto";

export type Telemetry = {
  getCorrelationId(): string;
  withTrace<T>(
    meta: { name: string; correlationId: string; userId?: string },
    fn: () => Promise<T>
  ): Promise<T>;
  traceLLMCall<T>(meta: { model: string }, fn: () => Promise<T>): Promise<T>;
  traceToolCall<T>(meta: { toolName: string }, fn: () => Promise<T>): Promise<T>;
};

export const telemetry: Telemetry = {
  getCorrelationId() {
    return randomUUID();
  },

  async withTrace(_meta, fn) {
    return await fn();
  },

  async traceLLMCall(_meta, fn) {
    return await fn();
  },

  async traceToolCall(_meta, fn) {
    return await fn();
  }
};

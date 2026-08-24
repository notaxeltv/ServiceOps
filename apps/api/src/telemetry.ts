/**
 * OpenTelemetry bootstrap — import before NestFactory in main.ts.
 * Enable with OTEL_ENABLED=1 and optional OTEL_EXPORTER_OTLP_ENDPOINT.
 */
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

if (process.env.OTEL_ENABLED === '1') {
  const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
  const sdk = new NodeSDK({
    serviceName: process.env.OTEL_SERVICE_NAME ?? 'serviceops-api',
  traceExporter: endpoint ? new OTLPTraceExporter({ url: endpoint }) : undefined,
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-fs': { enabled: false },
      }),
    ],
  });

  sdk.start();
  console.log(
    `[otel] tracing enabled${endpoint ? ` → ${endpoint}` : ' (default exporter)'}`,
  );
}

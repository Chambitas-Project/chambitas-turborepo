import { Injectable, LoggerService, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST })
export class StructuredLogger implements LoggerService {
  private context: string = 'App';
  private correlationId: string = 'N/A';

  setContext(context: string) {
    this.context = context;
  }

  setCorrelationId(id: string) {
    this.correlationId = id;
  }

  log(message: any, ...optionalParams: any[]) {
    this.print('INFO', message, optionalParams);
  }

  error(message: any, ...optionalParams: any[]) {
    this.print('ERROR', message, optionalParams);
  }

  warn(message: any, ...optionalParams: any[]) {
    this.print('WARN', message, optionalParams);
  }

  debug(message: any, ...optionalParams: any[]) {
    this.print('DEBUG', message, optionalParams);
  }

  private print(level: string, message: any, params: any[]) {
    const logObject = {
      timestamp: new Date().toISOString(),
      level,
      context: this.context,
      correlationId: this.correlationId,
      message: typeof message === 'object' ? message : message,
      ...(params.length > 0 ? { metadata: params } : {}),
    };
    console.log(JSON.stringify(logObject));
  }
}

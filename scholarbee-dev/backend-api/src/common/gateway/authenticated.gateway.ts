import { HttpException, Logger, UnauthorizedException } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { AuthenticatedSocket } from 'src/auth/types/auth.interface';
import { stringToObjectId } from 'src/utils/db.utils';

/**
 * Client should be listening to these events from the server
 */
enum ClientEventListener {
  ERROR = 'error',
}


export abstract class AuthenticatedGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  @WebSocketServer()
  server: Server;

  protected readonly logger = new Logger(this.constructor.name);

  // Note: In the base AuthGateway, authService and logger are marked as protected so that child classes can access them if needed (e.g., for logging or advanced authentication logic). If you want to restrict access to only the base class, use private. However, protected is more flexible for extensible base classes.
  constructor(protected readonly authService: AuthService) { }

  // This is called by NestJS on every new connection
  async handleConnection(client: AuthenticatedSocket, ...args: any[]) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/0eebece3-3041-41f3-80be-09eb91ea547f', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'authenticated.gateway.ts:32', message: 'handleConnection entry', data: { clientId: client.id, connected: client.connected, disconnected: client.disconnected }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
    // #endregion
    try {
      const queryToken = client.handshake.query.token;
      const headerToken = client.handshake.headers.authorization?.split(' ')[1];
      const token = queryToken || headerToken;

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/0eebece3-3041-41f3-80be-09eb91ea547f', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'authenticated.gateway.ts:38', message: 'Token extracted', data: { hasQueryToken: !!queryToken, hasHeaderToken: !!headerToken, hasToken: !!token, tokenLength: token?.length || 0 }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' }) }).catch(() => { });
      // #endregion

      if (!token) throw new UnauthorizedException('No token provided');

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/0eebece3-3041-41f3-80be-09eb91ea547f', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'authenticated.gateway.ts:42', message: 'Before verifyAuthToken', data: { tokenType: typeof token }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' }) }).catch(() => { });
      // #endregion

      const userTokenPayload = await this.authService.verifyAuthToken(token).catch((err) => {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/0eebece3-3041-41f3-80be-09eb91ea547f', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'authenticated.gateway.ts:44', message: 'verifyAuthToken error caught', data: { errorType: err?.constructor?.name, errorMessage: err?.message, errorStack: err?.stack?.substring(0, 200) }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' }) }).catch(() => { });
        // #endregion
        throw new UnauthorizedException(err.message);
      });
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/0eebece3-3041-41f3-80be-09eb91ea547f', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'authenticated.gateway.ts:48', message: 'verifyAuthToken success', data: { userId: userTokenPayload?.sub }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' }) }).catch(() => { });
      // #endregion
      client.data.user = {
        ...userTokenPayload,
        campus_id: stringToObjectId(userTokenPayload.campus_id),
        university_id: stringToObjectId(userTokenPayload.university_id),
      };

      await this.onAuthenticatedConnection(client, ...args);
    } catch (err) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/0eebece3-3041-41f3-80be-09eb91ea547f', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'authenticated.gateway.ts:52', message: 'Error caught in handleConnection', data: { errorType: err?.constructor?.name, errorMessage: err?.message, isUnauthorizedException: err instanceof UnauthorizedException, clientConnected: client.connected, clientDisconnected: client.disconnected }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
      // #endregion
      this.logger.warn(
        `Disconnecting client: ${client.id} due to auth failure`,
      );
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/0eebece3-3041-41f3-80be-09eb91ea547f', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'authenticated.gateway.ts:74', message: 'Before disconnect due to auth failure', data: { clientConnected: client.connected, clientDisconnected: client.disconnected, errorMessage: err?.message }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
      // #endregion
      
      try {
        // Disconnect immediately with a reason to avoid any issues with error emission
        // Using disconnect(true) forces immediate disconnect and prevents reconnection attempts
        client.disconnect(true);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/0eebece3-3041-41f3-80be-09eb91ea547f', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'authenticated.gateway.ts:80', message: 'After disconnect', data: { clientConnected: client.connected, clientDisconnected: client.disconnected }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
        // #endregion
      } catch (disconnectErr) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/0eebece3-3041-41f3-80be-09eb91ea547f', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'authenticated.gateway.ts:84', message: 'Error during disconnect', data: { disconnectErrorType: disconnectErr?.constructor?.name, disconnectErrorMessage: disconnectErr?.message, disconnectErrorStack: disconnectErr?.stack?.substring(0, 200) }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
        // #endregion
        this.logger.error(`Failed to disconnect client ${client.id}:`, disconnectErr);
      }
    }
  }

  // This is called by NestJS on every disconnect
  handleDisconnect(client: AuthenticatedSocket) {
    this.onAuthenticatedDisconnect(client);
  }

  afterInit(server: Server) {
    this.logger.log('Authenticated WebSocket Gateway initialized');
    this.onAuthenticatedInit(server);
  }

  // TODO: Explain this i.e. `protected abstract`
  // TODO: Explain why not simply have callback functions instead
  // Hooks for child classes to override
  protected abstract onAuthenticatedConnection(
    client: AuthenticatedSocket,
    ...args: any[]
  ): Promise<void> | void;

  protected abstract onAuthenticatedDisconnect(
    client: AuthenticatedSocket,
  ): void;

  protected abstract onAuthenticatedInit(server: Server): void;
}

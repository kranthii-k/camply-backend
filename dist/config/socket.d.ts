import { Server } from "socket.io";
import http from "http";
export declare let io: Server;
export declare function getIo(): Server;
export declare function initSocket(httpServer: http.Server): Promise<Server<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any>>;
//# sourceMappingURL=socket.d.ts.map
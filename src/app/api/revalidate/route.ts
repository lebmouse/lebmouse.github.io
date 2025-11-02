import { sseManager } from "@/lib/sse/manager";

export function GET() {
  // GET 요청에 대해서는 streaming response를 반환해야 하므로
  // Edge runtime으로 설정하는 것이 Vercel 등에서는 권장되나,
  // 온프레미스 단일 Node.js 서버에서는 상관 없습니다.
  // export const runtime = 'edge'; // 필요시 추가

  let streamController: ReadableStreamDefaultController<unknown> | undefined;

  const stream = new ReadableStream({
    start(controller) {
      streamController = controller;
      sseManager.addClient(streamController);
    },
    cancel() {
      if (streamController) {
        sseManager.removeClient(streamController);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

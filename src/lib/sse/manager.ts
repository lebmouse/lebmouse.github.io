// 여러 클라이언트 컨트롤러를 관리할 Set
// Set을 사용하면 중복을 방지하고 추가/삭제가 용이합니다.

// 싱글톤 패턴을 위한 전역 객체 참조
const globalForSSE = globalThis as unknown as {
  sseClients?: Set<ReadableStreamDefaultController<unknown>>;
};

// 클라이언트 Set을 초기화하거나 기존 것을 가져오는 함수
function getClients(): Set<ReadableStreamDefaultController<unknown>> {
  if (!globalForSSE.sseClients) {
    globalForSSE.sseClients = new Set();
    console.log("\x1b[36mSSE: 새로운 클라이언트 Set이 생성되었습니다.\x1b[0m");
  }
  return globalForSSE.sseClients;
}

export const sseManager = {
  /**
   * 새로운 클라이언트를 연결 목록에 추가합니다.
   * @param controller 클라이언트의 ReadableStream 컨트롤러
   */
  addClient(controller: ReadableStreamDefaultController<unknown>) {
    const clients = getClients();
    clients.add(controller);
    // 초록색 콘솔 출력 (ANSI escape code 사용)
    console.log(
      `\x1b[32mSSE: 클라이언트 연결됨. 현재 연결 수: ${clients.size}\x1b[0m`
    );
  },

  /**
   * 클라이언트 연결을 목록에서 제거합니다.
   * @param controller 클라이언트의 ReadableStream 컨트롤러
   */
  removeClient(controller: ReadableStreamDefaultController<unknown>) {
    const clients = getClients();
    clients.delete(controller);
    // 노란색 콘솔 출력 (ANSI escape code 사용)
    console.log(
      `\x1b[33mSSE: 클라이언트 연결 끊김. 현재 연결 수: ${clients.size}\x1b[0m`
    );
  },

  /**
   * 연결된 모든 클라이언트에게 메시지를 브로드캐스트합니다.
   * @param tag 재검증된 데이터 태그
   */
  broadcast(tag: string) {
    const clients = getClients();

    if (clients.size === 0) {
      console.log("SSE: 연결된 클라이언트가 없어 브로드캐스트하지 않음");
      return;
    }

    const message = `data: ${JSON.stringify({ tag, time: new Date().toISOString() })}\n\n`;
    const encodedMessage = new TextEncoder().encode(message);

    console.log(
      `SSE: ${clients.size}개의 클라이언트에게 '${tag}' 이벤트 브로드캐스팅`
    );

    // Set을 배열로 복사하여 순회 중 수정 방지
    const clientsArray = Array.from(clients);
    clientsArray.forEach((controller) => {
      try {
        controller.enqueue(encodedMessage);
      } catch (error) {
        // 전송 실패 시(예: 클라이언트가 비정상 종료) 목록에서 제거
        console.error("SSE 메시지 전송 실패, 해당 클라이언트 제거:", error);
        this.removeClient(controller);
      }
    });
  },

  /**
   * 현재 연결된 클라이언트 수를 반환합니다.
   */
  getClientCount(): number {
    const clients = getClients();
    return clients.size;
  },

  /**
   * 모든 클라이언트 연결을 정리합니다.
   */
  clearAllClients() {
    const clients = getClients();
    clients.clear();
    console.log("\x1b[31mSSE: 모든 클라이언트 연결이 정리되었습니다.\x1b[0m");
  },

  /**
   * 디버깅을 위한 현재 상태 정보를 반환합니다.
   */
  getDebugInfo() {
    const clients = getClients();
    return {
      clientCount: clients.size,
      isGlobalSet: clients === globalForSSE.sseClients,
      globalSetExists: !!globalForSSE.sseClients,
    };
  },
};

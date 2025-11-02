"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type SseMessage = {
  tag: string;
  time: string; // ISO datetime string
};

function isSseMessage(value: unknown): value is SseMessage {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const obj = value as Record<string, unknown>;

  if (typeof obj.tag !== "string") {
    return false;
  }

  if (typeof obj.time !== "string") {
    return false;
  }

  // ISO datetime 형식 검증 (예: "2024-01-01T00:00:00Z" 또는 "2024-01-01T00:00:00.000Z")
  const isoDateTimeRegex =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:\d{2})$/;
  if (!isoDateTimeRegex.test(obj.time)) {
    return false;
  }

  // Date 객체로 파싱 가능한지 확인
  const date = new Date(obj.time);
  if (isNaN(date.getTime())) {
    return false;
  }

  return true;
}

function parseSseMessage(value: unknown): SseMessage | null {
  if (isSseMessage(value)) {
    return value;
  }
  return null;
}

// 이 컴포넌트를 revalidate가 필요한 페이지의 Layout이나 공통 컴포넌트에 추가하세요.
function useRealtimeUpdater() {
  const router = useRouter();

  useEffect(() => {
    // SSE 엔드포인트에 연결
    const eventSource = new EventSource("/api/revalidate");
    console.log("Event source created", eventSource);
    // 메시지 수신 리스너
    eventSource.onmessage = (event) => {
      try {
        const rawData: unknown = JSON.parse(event.data as string);

        const data = parseSseMessage(rawData);

        if (data === null) {
          console.error("SSE 메시지 스키마 검증 실패:", rawData);
          return;
        }
        console.log("SSE 메시지 수신:", data);

        // 이 컴포넌트가 수신해야 할 태그와 일치하는 경우에만 화면 갱신
        if (data.tag) {
          console.log(
            `'${data.tag}' 태그 변경 감지. router.refresh()를 실행합니다.`
          );
          router.refresh();
        }
      } catch (error) {
        console.error("SSE 메시지 파싱 오류:", error);
      }
    };

    // 오류 발생 시 처리
    eventSource.onerror = (error) => {
      console.error("SSE 연결 오류:", error);
      // 필요하다면 여기서 연결을 닫고 재연결 로직을 추가할 수 있습니다.
      eventSource.close();
    };

    // 컴포넌트가 언마운트될 때 SSE 연결 정리
    return () => {
      console.log("SSE 연결을 닫습니다.");
      eventSource.close();
    };
  }, [router]);
}

export function Subscriber() {
  useRealtimeUpdater();
  return null;
}

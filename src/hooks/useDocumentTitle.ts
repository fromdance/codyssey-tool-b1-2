import { useEffect } from 'react';

/** 페이지마다 브라우저 탭 제목을 바꿉니다. title 이 바뀔 때만 실행됩니다. */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} | 할 일 노트` : '할 일 노트';
  }, [title]);
}

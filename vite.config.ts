import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // 컨테이너 밖(호스트)에서 접속하려면 0.0.0.0 으로 열어야 합니다.
    host: true,
    port: 5173,
    watch: {
      // 바인드 마운트에서는 파일 변경 이벤트가 전달되지 않을 수 있어
      // 폴링을 켭니다. (HMR 이 안 먹을 때의 단골 원인)
      usePolling: true,
      interval: 300,
    },
  },
  preview: {
    host: true,
    port: 4173,
  },
});

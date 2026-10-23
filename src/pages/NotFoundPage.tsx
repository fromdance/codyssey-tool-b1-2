import { useLocation } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { EmptyState } from '../components/EmptyState';
import { LinkButton } from '../components/Button';

export default function NotFoundPage() {
  useDocumentTitle('페이지 없음');
  const { pathname } = useLocation();

  return (
    <section className="narrow">
      <EmptyState
        title="페이지를 찾을 수 없습니다."
        message={`${pathname} 주소에는 페이지가 없습니다. 주소를 확인하거나 홈으로 이동하세요.`}
        action={<LinkButton to="/">홈으로 가기</LinkButton>}
      />
    </section>
  );
}

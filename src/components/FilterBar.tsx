import type { SortOrder, StatusFilter } from '../lib/types';

interface FilterBarProps {
  status: StatusFilter;
  onStatusChange: (value: StatusFilter) => void;
  query: string;
  onQueryChange: (value: string) => void;
  sort: SortOrder;
  onSortChange: (value: SortOrder) => void;
  counts: Record<StatusFilter, number>;
}

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'active', label: '진행 중' },
  { value: 'done', label: '완료' },
];

/** 상태는 부모(페이지)가 갖고, 이 컴포넌트는 값을 보여주고 변경을 알리기만 합니다. (상태 끌어올리기) */
export function FilterBar({ status, onStatusChange, query, onQueryChange, sort, onSortChange, counts }: FilterBarProps) {
  return (
    <div className="filter-bar">
      <div className="tabs" role="tablist" aria-label="완료 여부로 거르기">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={status === tab.value}
            className={`tabs__tab ${status === tab.value ? 'tabs__tab--active' : ''}`}
            onClick={() => onStatusChange(tab.value)}
          >
            {tab.label} <span className="tabs__count">{counts[tab.value]}</span>
          </button>
        ))}
      </div>
      <div className="filter-bar__controls">
        <input
          type="search"
          className="field__control"
          placeholder="제목으로 찾기"
          aria-label="제목으로 찾기"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
        <select
          className="field__control"
          aria-label="정렬"
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortOrder)}
        >
          <option value="newest">최근 추가순</option>
          <option value="due">마감 빠른순</option>
          <option value="priority">우선순위순</option>
        </select>
      </div>
    </div>
  );
}

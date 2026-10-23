import { NavLink, Outlet } from 'react-router-dom';
import { ToastContainer } from './ToastContainer';

const NAV = [
  { to: '/', label: '홈', end: true },
  { to: '/todos', label: '할 일 목록', end: true },
  { to: '/todos/new', label: '새 할 일', end: true },
];

/** 모든 페이지에 공통으로 붙는 헤더/네비게이션. 페이지 내용은 <Outlet /> 자리에 들어옵니다. */
export function Layout() {
  return (
    <div className="app">
      <header className="header">
        <div className="header__inner">
          <NavLink to="/" className="logo">
            할 일 노트
          </NavLink>
          <nav aria-label="주요 메뉴">
            <ul className="nav">
              {NAV.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) => `nav__link ${isActive ? 'nav__link--active' : ''}`}
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
      <main className="main">
        <Outlet />
      </main>
      <ToastContainer />
    </div>
  );
}

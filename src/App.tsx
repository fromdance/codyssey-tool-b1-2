import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import HomePage from './pages/HomePage';
import TodoListPage from './pages/TodoListPage';
import TodoNewPage from './pages/TodoNewPage';
import TodoDetailPage from './pages/TodoDetailPage';
import TodoEditPage from './pages/TodoEditPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="todos" element={<TodoListPage />} />
        <Route path="todos/new" element={<TodoNewPage />} />
        <Route path="todos/:id" element={<TodoDetailPage />} />
        <Route path="todos/:id/edit" element={<TodoEditPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

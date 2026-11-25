import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { errorMessage } from '../api/axios';
import { CheckCard, Pagination, Spinner, Empty } from '../components/ui';
import { CATEGORIES, VERDICTS } from '../utils/verdicts';

export default function Checks() {
  const [filters, setFilters] = useState({ search: '', verdict: '', category: '', sort: '-createdAt', page: 1 });
  const [search, setSearch] = useState('');
  const [result, setResult] = useState(null);

  // debounce the search box (wait 400ms after typing stops)
  useEffect(() => {
    const t = setTimeout(() => setFilters((f) => (f.search === search ? f : { ...f, search, page: 1 })), 400);
    return () => clearTimeout(t);
  }, [search]);

  const load = () => {
    setResult(null);
    api
      .get('/analyses', { params: filters })
      .then((res) => setResult(res.data))
      .catch((err) => toast.error(errorMessage(err)));
  };
  useEffect(load, [filters]);

  const setFilter = (key) => (e) => setFilters({ ...filters, [key]: e.target.value, page: 1 });

  const remove = async (check) => {
    if (!window.confirm(`Delete "${check.title}"?`)) return;
    try {
      await api.delete(`/analyses/${check._id}`);
      toast.success('Check deleted');
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Checks</h1>
          <p className="muted">{result ? `${result.pagination.total} result(s)` : 'Loading…'}</p>
        </div>
        <Link to="/checks/new" className="btn btn-primary">+ New Check</Link>
      </div>

      <div className="card filters">
        <input placeholder="Search by title…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={filters.verdict} onChange={setFilter('verdict')}>
          <option value="">All verdicts</option>
          {Object.entries(VERDICTS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={filters.category} onChange={setFilter('category')}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filters.sort} onChange={setFilter('sort')}>
          <option value="-createdAt">Newest first</option>
          <option value="createdAt">Oldest first</option>
          <option value="-score">Highest score</option>
          <option value="score">Lowest score</option>
        </select>
      </div>

      {!result ? (
        <Spinner />
      ) : result.data.length === 0 ? (
        <Empty title="No checks found" text="Try different filters or run a new check." action={<Link to="/checks/new" className="btn btn-primary">New check</Link>} />
      ) : (
        <>
          <div className="grid-3">
            {result.data.map((c) => <CheckCard key={c._id} check={c} onDelete={remove} />)}
          </div>
          <Pagination page={result.pagination.page} pages={result.pagination.pages} onChange={(page) => setFilters({ ...filters, page })} />
        </>
      )}
    </>
  );
}

function Pagination({ currentPage, totalItems, pageSize, onPageChange }) {
  const totalPages = Math.ceil(totalItems / pageSize);

  if (totalPages <= 1) {
    return null;
  }

  // Generate numbered pages to display (max 5 buttons)
  const getPageNumbers = () => {
    const pages = [];
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);

    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return { pages, hasStartEllipsis: startPage > 1, hasEndEllipsis: endPage < totalPages };
  };

  const { pages, hasStartEllipsis, hasEndEllipsis } = getPageNumbers();

  return (
    <nav className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-3" aria-label="Pagination">
      <span className="text-muted small">
        Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalItems)} of {totalItems}
      </span>
      <div className="btn-group shadow-sm" role="group">
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          title="Previous page"
        >
          <i className="bi bi-chevron-left me-1"></i>Prev
        </button>

        {hasStartEllipsis && (
          <>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={() => onPageChange(1)}
            >
              1
            </button>
            <span className="btn btn-light btn-sm disabled px-2">…</span>
          </>
        )}

        {pages.map((p) => (
          <button
            key={p}
            type="button"
            className={`btn btn-sm ${p === currentPage ? 'btn-primary text-white fw-bold' : 'btn-outline-secondary'}`}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        ))}

        {hasEndEllipsis && (
          <>
            <span className="btn btn-light btn-sm disabled px-2">…</span>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={() => onPageChange(totalPages)}
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          title="Next page"
        >
          Next<i className="bi bi-chevron-right ms-1"></i>
        </button>
      </div>
    </nav>
  );
}

export default Pagination;

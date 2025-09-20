import React from 'react'

interface PageCounterProps {
  currentPage: number
  totalPages: number
}

function PageCounter({ currentPage, totalPages }: PageCounterProps) {
  return (
    <div className="page-counter">
      {currentPage} / {totalPages}
    </div>
  )
}

export default React.memo(PageCounter)
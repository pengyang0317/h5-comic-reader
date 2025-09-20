import React, { useState, useCallback, useEffect } from 'react'

interface JumpDialogProps {
  visible: boolean
  currentPage: number
  totalPages: number
  onJump: (page: number) => void
  onClose: () => void
}

function JumpDialog({ visible, currentPage, totalPages, onJump, onClose }: JumpDialogProps) {
  const [inputValue, setInputValue] = useState(currentPage.toString())
  const [error, setError] = useState('')

  useEffect(() => {
    if (visible) {
      setInputValue(currentPage.toString())
      setError('')
    }
  }, [visible, currentPage])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()

    const page = parseInt(inputValue)

    if (isNaN(page)) {
      setError('请输入有效的页码')
      return
    }

    if (page < 1 || page > totalPages) {
      setError(`页码范围：1-${totalPages}`)
      return
    }

    onJump(page)
  }, [inputValue, totalPages, onJump])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }, [onClose])

  if (!visible) return null

  return (
    <div className="jump-dialog-overlay" onClick={onClose}>
      <div className="jump-dialog" onClick={e => e.stopPropagation()}>
        <h3>跳转到页面</h3>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="pageInput">页码 (1-{totalPages})</label>
            <input
              id="pageInput"
              type="number"
              min="1"
              max={totalPages}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              className="page-input"
            />
          </div>

          {error && <div className="error-text">{error}</div>}

          <div className="dialog-buttons">
            <button type="button" onClick={onClose} className="btn-cancel">
              取消
            </button>
            <button type="submit" className="btn-confirm">
              跳转
            </button>
          </div>
        </form>

        <div className="quick-jumps">
          <span>快速跳转：</span>
          <button onClick={() => onJump(1)} className="quick-btn">首页</button>
          <button onClick={() => onJump(Math.floor(totalPages / 4))} className="quick-btn">1/4</button>
          <button onClick={() => onJump(Math.floor(totalPages / 2))} className="quick-btn">中间</button>
          <button onClick={() => onJump(Math.floor(totalPages * 3 / 4))} className="quick-btn">3/4</button>
          <button onClick={() => onJump(totalPages)} className="quick-btn">末页</button>
        </div>
      </div>
    </div>
  )
}

export default React.memo(JumpDialog)
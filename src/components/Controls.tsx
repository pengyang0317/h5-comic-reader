import React from 'react'

interface ControlsProps {
  onToggleAutoRead: () => void
  onTogglePerformanceMonitor: () => void
  onToggleJumpDialog: () => void
  isAutoReading: boolean
}

function Controls({
  onToggleAutoRead,
  onTogglePerformanceMonitor,
  onToggleJumpDialog,
  isAutoReading
}: ControlsProps) {
  return (
    <div className="controls">
      <button
        className="control-btn"
        onClick={onTogglePerformanceMonitor}
        type="button"
      >
        性能
      </button>

      <button
        className="control-btn"
        onClick={onToggleJumpDialog}
        type="button"
      >
        跳转
      </button>

      <button
        className={`control-btn ${isAutoReading ? 'active' : ''}`}
        onClick={onToggleAutoRead}
        type="button"
      >
        {isAutoReading ? '停止' : '自动'}
      </button>
    </div>
  )
}

export default React.memo(Controls)
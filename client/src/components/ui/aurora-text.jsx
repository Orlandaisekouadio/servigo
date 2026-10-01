// AuroraText — portage du composant Magic UI (gradient animé, accessible).
import React, { memo } from 'react'

function cx(...parts) {
  return parts.filter(Boolean).join(' ')
}

const AuroraText = memo(
  ({ children, className = '', colors = ['#15803d', '#62df7d', '#f97316', '#166534'], speed = 1 }) => {
    const gradientStyle = {
      backgroundImage: `linear-gradient(135deg, ${colors.join(', ')}, ${colors[0]})`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      animationDuration: `${10 / speed}s`,
    }

    return (
      <span className={cx('relative inline-block', className)}>
        <span className="sr-only">{children}</span>
        <span
          className="animate-aurora relative bg-size-[200%_auto] bg-clip-text text-transparent"
          style={gradientStyle}
          aria-hidden="true"
        >
          {children}
        </span>
      </span>
    )
  }
)

AuroraText.displayName = 'AuroraText'

export default AuroraText
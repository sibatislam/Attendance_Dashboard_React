export default function ActivityBar({ 
  title, 
  color, 
  lightColor,
  dataKey, 
  data, 
  compareData, 
  groupKey,
  compareMode,
  file1Label,
  file2Label
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <span className="w-3 h-3 rounded" style={{ backgroundColor: color }}></span>
          {title}
        </h4>
        {compareMode && compareData.length > 0 && (
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded" style={{ backgroundColor: color }}></span>
              <span className="text-gray-600">{file1Label || 'File 1'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded" style={{ backgroundColor: lightColor || color, opacity: 0.7 }}></span>
              <span className="text-gray-600">{file2Label || 'File 2'}</span>
            </div>
          </div>
        )}
      </div>
      {data.map((item, idx) => {
        const allValues = compareMode && compareData.length > 0
          ? [...data.map(d => d[dataKey] || 0), ...compareData.map(d => d[dataKey] || 0)]
          : data.map(d => d[dataKey] || 0)
        const maxValue = Math.max(...allValues, 1)
        const percentage = ((item[dataKey] || 0) / maxValue) * 100
        const compareItem = compareMode ? compareData.find(d => d[groupKey] === item[groupKey]) : null
        const comparePercentage = compareItem ? ((compareItem[dataKey] || 0) / maxValue) * 100 : 0
        
        return (
          <div key={item[groupKey]} className="mb-4">
            <div className="flex items-center gap-4 mb-1">
              <div className="w-96 text-sm text-gray-700 font-medium" style={{ wordBreak: 'break-word', lineHeight: '1.4' }} title={item[groupKey]}>{item[groupKey]}</div>
              <div className="flex-1 relative">
                <div className="w-full bg-gray-100 rounded-full h-7 relative">
                  <div 
                    className="h-full rounded-full flex items-center justify-end pr-3 text-white text-xs font-bold animate-slide-in cursor-pointer hover:opacity-90 transition-opacity"
                    style={{ 
                      width: `${Math.max(percentage, 2)}%`,
                      backgroundColor: color,
                      animationDelay: `${idx * 50}ms`
                    }}
                    title={`${item[groupKey]}: ${item[dataKey] || 0} ${title}`}
                  >
                    {(item[dataKey] > 0) && item[dataKey]}
                  </div>
                </div>
              </div>
            </div>
            {compareMode && compareItem && (
              <div className="flex items-center gap-4">
                <div className="w-96"></div>
                <div className="flex-1 relative">
                  <div className="w-full bg-gray-50 rounded-full h-6 relative">
                    <div 
                      className="h-full rounded-full flex items-center justify-end pr-3 text-white text-xs font-bold animate-slide-in opacity-70 cursor-pointer hover:opacity-90 transition-opacity"
                      style={{ 
                        width: `${Math.max(comparePercentage, 2)}%`,
                        backgroundColor: lightColor || color,
                        animationDelay: `${(idx * 50) + 400}ms`
                      }}
                      title={`${compareItem[groupKey]}: ${compareItem[dataKey] || 0} ${title} (${file2Label || 'File 2'})`}
                    >
                      {(compareItem[dataKey] > 0) && compareItem[dataKey]}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}


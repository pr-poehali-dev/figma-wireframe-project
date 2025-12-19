import { useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { ArchElement, ArchConnection, ArchGroup } from './ArchitectureStudio';

interface ArchitectureCanvasProps {
  archElements: ArchElement[];
  archGroups: ArchGroup[];
  connections: ArchConnection[];
  selectedElement: ArchElement | null;
  selectedGroup: number | null;
  c4Level: string;
  zoom: number;
  gridEnabled: boolean;
  showConnectionLines: boolean;
  showGroups: boolean;
  isTransitioning: boolean;
  draggingElement: number | null;
  draggingGroup: number | null;
  resizingGroup: { id: number; corner: string } | null;
  isDrawingConnection: boolean;
  connectionStart: number | null;
  isDragging: boolean;
  hoveredConnection: number | null;
  GRID_SIZE: number;
  getIconForType: (type: string) => string;
  handleMouseDown: (e: React.MouseEvent, elementId: number) => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseUp: () => void;
  handleElementClick: (element: ArchElement, e?: React.MouseEvent) => void;
  handleElementDoubleClick: (element: ArchElement, e?: React.MouseEvent) => void;
  deleteElement: (id: number) => void;
  deleteGroup: (id: number) => void;
  setSelectedGroup: (id: number) => void;
  setDraggingGroup: (id: number | null) => void;
  setResizingGroup: (val: { id: number; corner: string } | null) => void;
  setDragOffset: (offset: { x: number; y: number }) => void;
  setHoveredConnection: (id: number | null) => void;
  setSelectedElement: (el: ArchElement | null) => void;
  getElementById: (id: number) => ArchElement | undefined;
}

export default function ArchitectureCanvas({
  archElements,
  archGroups,
  connections,
  selectedElement,
  selectedGroup,
  c4Level,
  zoom,
  gridEnabled,
  showConnectionLines,
  showGroups,
  isTransitioning,
  draggingElement,
  draggingGroup,
  resizingGroup,
  isDrawingConnection,
  connectionStart,
  isDragging,
  hoveredConnection,
  GRID_SIZE,
  getIconForType,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  handleElementClick,
  handleElementDoubleClick,
  deleteElement,
  deleteGroup,
  setSelectedGroup,
  setDraggingGroup,
  setResizingGroup,
  setDragOffset,
  setHoveredConnection,
  setSelectedElement,
  getElementById,
}: ArchitectureCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);

  const getElementPosition = (id: number): { x: number, y: number } => {
    const element = getElementById(id);
    return element ? { x: element.x + 80, y: element.y + 50 } : { x: 0, y: 0 };
  };

  const renderConnectionLine = (conn: ArchConnection) => {
    const from = getElementPosition(conn.from);
    const to = getElementPosition(conn.to);
    
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    
    const isHovered = hoveredConnection === conn.id;
    const color = conn.type === 'sync' ? '#3b82f6' : conn.type === 'async' ? '#f59e0b' : '#10b981';
    
    return (
      <g key={conn.id}>
        <line
          x1={from.x}
          y1={from.y}
          x2={to.x}
          y2={to.y}
          stroke={color}
          strokeWidth={isHovered ? 3 : 2}
          strokeDasharray={conn.type === 'async' ? '5,5' : '0'}
          className="transition-all duration-200"
          onMouseEnter={() => setHoveredConnection(conn.id)}
          onMouseLeave={() => setHoveredConnection(null)}
          style={{ cursor: 'pointer' }}
        >
          <animate
            attributeName="stroke-dashoffset"
            from="0"
            to={conn.type === 'async' ? "10" : "0"}
            dur="1s"
            repeatCount="indefinite"
          />
        </line>
        
        <polygon
          points={`${to.x},${to.y} ${to.x - 10},${to.y - 5} ${to.x - 10},${to.y + 5}`}
          fill={color}
          transform={`rotate(${angle} ${to.x} ${to.y})`}
        />
        
        {isHovered && (
          <g>
            <rect
              x={(from.x + to.x) / 2 - 60}
              y={(from.y + to.y) / 2 - 20}
              width="120"
              height="40"
              fill="rgba(0,0,0,0.9)"
              rx="6"
            />
            <text
              x={(from.x + to.x) / 2}
              y={(from.y + to.y) / 2 - 5}
              textAnchor="middle"
              fill="white"
              fontSize="11"
              fontWeight="600"
            >
              {conn.protocol}
            </text>
            <text
              x={(from.x + to.x) / 2}
              y={(from.y + to.y) / 2 + 10}
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="9"
            >
              {conn.description}
            </text>
          </g>
        )}
      </g>
    );
  };

  return (
    <div className="flex-1 relative bg-background overflow-hidden">
      {gridEnabled && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, hsl(var(--border) / 0.4) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--border) / 0.4) 1px, transparent 1px)
            `,
            backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
            backgroundPosition: '32px 32px'
          }}
        />
      )}

      <div 
        ref={canvasRef}
        className="absolute inset-0 p-8 overflow-auto"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={() => {
          if (!isDrawingConnection) {
            setSelectedElement(null);
          }
        }}
      >
        <div 
          className={`relative transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
          style={{ 
            transform: `scale(${zoom / 100})`, 
            transformOrigin: 'top left',
            width: '100%',
            height: '100%',
            minWidth: '1600px',
            minHeight: '900px'
          }}
        >
          {showGroups && archGroups.map(group => (
            <div
              key={group.id}
              className={`absolute border-2 border-dashed rounded-2xl transition-all ${
                selectedGroup === group.id ? 'border-solid shadow-2xl' : ''
              }`}
              style={{
                left: `${group.x}px`,
                top: `${group.y}px`,
                width: `${group.width}px`,
                height: `${group.height}px`,
                borderColor: group.color,
                backgroundColor: `${group.color}15`,
                zIndex: 0,
                cursor: draggingGroup === group.id ? 'grabbing' : 'grab'
              }}
              onMouseDown={(e) => {
                if (resizingGroup) return;
                e.stopPropagation();
                
                if (!canvasRef.current) return;
                const canvasRect = canvasRef.current.getBoundingClientRect();
                const scaledX = (e.clientX - canvasRect.left) / (zoom / 100);
                const scaledY = (e.clientY - canvasRect.top) / (zoom / 100);
                
                setDragOffset({
                  x: scaledX - group.x,
                  y: scaledY - group.y,
                });
                setDraggingGroup(group.id);
                setSelectedGroup(group.id);
              }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedGroup(group.id);
              }}
            >
              <div 
                className="absolute top-3 left-4 flex items-center gap-2 pointer-events-none"
                style={{ color: group.color }}
              >
                <Icon name="Layers" size={18} />
                <span className="font-semibold text-sm">{group.name}</span>
                {group.description && (
                  <span className="text-xs opacity-70">— {group.description}</span>
                )}
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-white opacity-0 hover:opacity-100 transition-opacity pointer-events-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteGroup(group.id);
                }}
              >
                <Icon name="X" size={12} />
              </Button>
              
              {['nw', 'ne', 'sw', 'se'].map(corner => (
                <div
                  key={corner}
                  className="absolute w-3 h-3 bg-white border-2 rounded-full opacity-0 hover:opacity-100 transition-opacity cursor-pointer pointer-events-auto"
                  style={{
                    borderColor: group.color,
                    top: corner.includes('n') ? '-6px' : 'auto',
                    bottom: corner.includes('s') ? '-6px' : 'auto',
                    left: corner.includes('w') ? '-6px' : 'auto',
                    right: corner.includes('e') ? '-6px' : 'auto',
                    cursor: corner === 'nw' || corner === 'se' ? 'nwse-resize' : 'nesw-resize'
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setResizingGroup({ id: group.id, corner });
                  }}
                />
              ))}
            </div>
          ))}

          {showConnectionLines && (
            <svg
              className="absolute inset-0 pointer-events-none"
              style={{ width: '100%', height: '100%', zIndex: 1 }}
            >
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
                </marker>
              </defs>
              <g className="pointer-events-auto">
                {connections.map(conn => renderConnectionLine(conn))}
              </g>
            </svg>
          )}

          {archElements.map(element => (
            <div
              key={element.id}
              className={`absolute transition-all ${
                draggingElement === element.id ? 'cursor-grabbing' : isDrawingConnection ? 'cursor-crosshair' : 'cursor-grab'
              } ${
                isDrawingConnection 
                  ? 'hover:ring-2 hover:ring-blue-400' 
                  : 'hover:ring-2 hover:ring-purple-400'
              } ${
                connectionStart === element.id ? 'ring-2 ring-blue-400 shadow-lg' : ''
              } ${
                selectedElement?.id === element.id ? 'ring-2 ring-purple-500 shadow-xl' : ''
              }`}
              style={{
                left: `${element.x}px`,
                top: `${element.y}px`,
                width: '160px',
                zIndex: draggingElement === element.id ? 100 : 10
              }}
              onMouseDown={(e) => handleMouseDown(e, element.id)}
              onClick={(e) => {
                if (!isDragging) {
                  handleElementClick(element, e);
                }
              }}
              onDoubleClick={(e) => handleElementDoubleClick(element, e)}
            >
              <Card className="p-4 bg-card/95 backdrop-blur-sm group relative">
                <div className="flex items-center justify-center mb-2">
                  <div className={`h-12 w-12 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 ${
                    element.layer === 'presentation' ? 'bg-gradient-to-br from-purple-500 to-blue-500' :
                    element.layer === 'business' ? 'bg-gradient-to-br from-green-500 to-emerald-500' :
                    'bg-gradient-to-br from-blue-500 to-cyan-500'
                  }`}>
                    <Icon name={getIconForType(element.type) as any} size={24} className="text-white" />
                  </div>
                </div>
                <h4 className="font-semibold text-center text-sm line-clamp-1">{element.name}</h4>
                <p className="text-xs text-muted-foreground text-center mt-1 line-clamp-1">{element.techStack}</p>
                
                {((c4Level === 'context' && element.id === 100) || 
                  (c4Level === 'container' && (element.type === 'microservice' || element.type === 'api-gateway')) ||
                  (c4Level === 'component' && element.type === 'serverless')) && (
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center animate-pulse">
                      <Icon name="ZoomIn" size={12} className="text-white" />
                    </div>
                  </div>
                )}
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteElement(element.id);
                  }}
                >
                  <Icon name="X" size={12} />
                </Button>
              </Card>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-4 left-4 bg-card border border-border rounded-lg p-3 flex items-center gap-2 text-xs shadow-lg">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
          <span className="font-semibold">{c4Level === 'context' ? 'Context' : c4Level === 'container' ? 'Container' : c4Level === 'component' ? 'Component' : 'Code'}</span>
        </div>
        <div className="h-4 w-px bg-border" />
        <span className="text-muted-foreground">Zoom: {zoom}%</span>
        <div className="h-4 w-px bg-border" />
        <span className="text-muted-foreground">Элементов: {archElements.length}</span>
        <div className="h-4 w-px bg-border" />
        <span className="text-muted-foreground">Связей: {connections.length}</span>
      </div>

      {connections.length > 0 && (
        <div className="absolute bottom-4 right-4 bg-card border border-border rounded-lg p-3 max-w-xs">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="Network" size={16} className="text-blue-400" />
            <h4 className="font-semibold text-xs">Активные связи</h4>
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {connections.slice(0, 3).map(conn => {
              const fromEl = getElementById(conn.from);
              const toEl = getElementById(conn.to);
              return (
                <div key={conn.id} className="text-xs flex items-center gap-1">
                  <span className="truncate">{fromEl?.name}</span>
                  <Icon name="ArrowRight" size={10} className="text-blue-400 flex-shrink-0" />
                  <span className="truncate">{toEl?.name}</span>
                </div>
              );
            })}
            {connections.length > 3 && (
              <p className="text-xs text-muted-foreground">+{connections.length - 3} еще...</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
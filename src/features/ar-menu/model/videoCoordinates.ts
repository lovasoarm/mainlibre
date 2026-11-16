export interface VideoGeometry {
  left: number;
  top: number;
  width: number;
  height: number;
  intrinsicWidth: number;
  intrinsicHeight: number;
}

export interface NormalizedPoint {
  x: number;
  y: number;
}

export function mapPointToCoverVideo(point: NormalizedPoint, geometry: VideoGeometry): NormalizedPoint {
  if (geometry.intrinsicWidth <= 0 || geometry.intrinsicHeight <= 0) {
    return { x: geometry.left + point.x * geometry.width, y: geometry.top + point.y * geometry.height };
  }
  const scale = Math.max(geometry.width / geometry.intrinsicWidth, geometry.height / geometry.intrinsicHeight);
  const renderedWidth = geometry.intrinsicWidth * scale;
  const renderedHeight = geometry.intrinsicHeight * scale;
  return {
    x: geometry.left + (geometry.width - renderedWidth) / 2 + point.x * renderedWidth,
    y: geometry.top + (geometry.height - renderedHeight) / 2 + point.y * renderedHeight,
  };
}

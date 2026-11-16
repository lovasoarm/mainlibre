import { describe, expect, it } from 'vitest';
import { mapPointToCoverVideo } from './videoCoordinates';

describe('mapPointToCoverVideo', () => {
  it('compense le recadrage vertical de object-fit cover', () => {
    const point = mapPointToCoverVideo({ x: 0.5, y: 0.5 }, {
      left: 100,
      top: 80,
      width: 1000,
      height: 500,
      intrinsicWidth: 640,
      intrinsicHeight: 480,
    });
    expect(point.x).toBe(600);
    expect(point.y).toBe(330);
  });

  it('utilise le rectangle vidéo avant disponibilité des dimensions natives', () => {
    const point = mapPointToCoverVideo({ x: 0.5, y: 0.25 }, {
      left: 20,
      top: 40,
      width: 800,
      height: 400,
      intrinsicWidth: 0,
      intrinsicHeight: 0,
    });
    expect(point).toEqual({ x: 420, y: 140 });
  });
});

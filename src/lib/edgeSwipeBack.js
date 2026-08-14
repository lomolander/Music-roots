export const EDGE_SWIPE_START_PX = 32;
export const EDGE_SWIPE_DISTANCE_PX = 85;
export const EDGE_SWIPE_DIRECTION_RATIO = 1.5;

export const isEdgeSwipeBack = ({ startX, startY, endX, endY }) => {
  const horizontalDistance = endX - startX;
  const verticalDistance = Math.abs(endY - startY);
  return startX <= EDGE_SWIPE_START_PX
    && horizontalDistance >= EDGE_SWIPE_DISTANCE_PX
    && horizontalDistance > verticalDistance * EDGE_SWIPE_DIRECTION_RATIO;
};


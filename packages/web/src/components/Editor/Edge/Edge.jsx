import { EdgeLabelRenderer, getBezierPath } from '@xyflow/react';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import PropTypes from 'prop-types';
import { useContext } from 'react';

import { EdgesContext } from '../contexts.js';

export default function Edge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  source,
  data: { laidOut },
}) {
  const { flowActive, onStepAdd, isCreateStepPending } =
    useContext(EdgesContext);

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition: 'bottom',
    targetPosition: 'top',
  });

  return (
    <>
      {/* Render the connecting line */}
      <path
        d={edgePath}
        stroke="#b1b1b7"
        strokeWidth={2}
        fill="none"
        markerEnd="url(#arrowhead)"
        style={{
          visibility: laidOut ? 'visible' : 'hidden',
        }}
      />
      
      {/* Arrow marker definition */}
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill="#b1b1b7"
          />
        </marker>
      </defs>
      
      <EdgeLabelRenderer>
        <IconButton
          onClick={() => onStepAdd(source)}
          color="primary"
          size="small"
          sx={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
            visibility: laidOut ? 'visible' : 'hidden',
            backgroundColor: 'white',
            border: '2px solid #e0e0e0',
            '&:hover': {
              backgroundColor: '#f5f5f5',
              border: '2px solid #1976d2',
            },
          }}
          disabled={isCreateStepPending || flowActive}
        >
          <AddIcon fontSize="small" />
        </IconButton>
      </EdgeLabelRenderer>
    </>
  );
}

Edge.propTypes = {
  sourceX: PropTypes.number.isRequired,
  sourceY: PropTypes.number.isRequired,
  targetX: PropTypes.number.isRequired,
  targetY: PropTypes.number.isRequired,
  source: PropTypes.string.isRequired,
  data: PropTypes.shape({
    laidOut: PropTypes.bool,
  }).isRequired,
};

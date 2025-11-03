import { useContext } from 'react';
import { Handle, Position } from '@xyflow/react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import IconButton from '@mui/material/IconButton';

import FlowStep from 'components/FlowStep';

import { NodesContext, EdgesContext } from '../contexts.js';
import { NodeWrapper, NodeInnerWrapper } from './style.js';

function FlowStepNode({ data: { laidOut, branches = [] }, id }) {
  const { onStepDelete, onStepSelect, flowId, steps } =
    useContext(NodesContext);
  const { onStepAdd, isCreateStepPending, flowActive } = useContext(EdgesContext);

  const step = steps.find(({ id: stepId }) => stepId === id);

  return (
    <NodeWrapper
      sx={{
        visibility: laidOut ? 'visible' : 'hidden',
        cursor: 'grab',
        '&:active': {
          cursor: 'grabbing',
        },
      }}
    >
      <NodeInnerWrapper>
        <Handle
          type="target"
          position={Position.Top}
          isConnectable={false}
          style={{ visibility: 'hidden' }}
        />
        {step && (
          <FlowStep
            step={step}
            onSelect={() => onStepSelect(step.id)}
            onDelete={onStepDelete}
            flowId={flowId}
          />
        )}
        
        {/* Multiple output handles for branches */}
        {branches.map((branch, index) => (
          <Handle
            key={`branch-${index}`}
            type="source"
            position={Position.Bottom}
            id={`branch-${index}`}
            isConnectable={false}
            style={{ 
              visibility: 'hidden',
              left: `${30 + (index * 40)}%`
            }}
          />
        ))}
        
        {/* Default output handle */}
        <Handle
          type="source"
          position={Position.Bottom}
          isConnectable={false}
          style={{ visibility: 'hidden' }}
        />
        
        {/* Add branch button */}
        {laidOut && (
          <Box
            sx={{
              position: 'absolute',
              bottom: -20,
              right: -20,
              zIndex: 10,
            }}
          >
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onStepAdd(id);
              }}
              size="small"
              disabled={isCreateStepPending || flowActive}
              sx={{
                backgroundColor: 'white',
                border: '2px solid #e0e0e0',
                width: 24,
                height: 24,
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                  border: '2px solid #1976d2',
                },
              }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
      </NodeInnerWrapper>
    </NodeWrapper>
  );
}

FlowStepNode.propTypes = {
  id: PropTypes.string,
  data: PropTypes.shape({
    laidOut: PropTypes.bool.isRequired,
    branches: PropTypes.array,
  }).isRequired,
};

export default FlowStepNode;

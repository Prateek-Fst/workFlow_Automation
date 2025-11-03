import {
  useEffect,
  useLayoutEffect,
  useCallback,
  useState,
  useMemo,
  useRef,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  ReactFlow,
  useEdgesState,
  applyNodeChanges,
  PanOnScrollMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { v4 as uuidv4 } from 'uuid';
import { debounce } from 'lodash';

import useUpdateStep from 'hooks/useUpdateStep';
import useCreateStep from 'hooks/useCreateStep';
import useUpdateFlow from 'hooks/useUpdateFlow';
import { FlowPropType } from 'propTypes/propTypes';

import { useScrollBoundaries } from './useScrollBoundaries';
import FlowStepNode from './FlowStepNode/FlowStepNode';
import Edge from './Edge/Edge';
import InvisibleNode from './InvisibleNode/InvisibleNode';
import { getLaidOutElements } from './utils';
import { EDGE_TYPES, INVISIBLE_NODE_ID, NODE_TYPES } from './constants';
import { EditorWrapper } from './style';
import { EdgesContext, NodesContext } from './contexts';
import StepDetailsSidebar from 'components/StepDetailsSidebar';

const ENABLE_AUTO_SELECT = false;

const nodeTypes = {
  [NODE_TYPES.FLOW_STEP]: FlowStepNode,
  [NODE_TYPES.INVISIBLE]: InvisibleNode,
};

const edgeTypes = {
  [EDGE_TYPES.ADD_NODE_EDGE]: Edge,
};

const Editor = ({ flow }) => {
  const { mutateAsync: updateStep } = useUpdateStep();
  const { mutateAsync: updateFlow } = useUpdateFlow(flow?.id);
  const queryClient = useQueryClient();

  const [nodes, setNodes] = useState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState();
  const [selectedStepId, setSelectedStepId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [containerHeight, setContainerHeight] = useState(null);
  const containerRef = useRef(null);
  const { mutateAsync: createStep, isPending: isCreateStepPending } =
    useCreateStep(flow?.id);

  useScrollBoundaries(containerHeight);

  const onStepDelete = useCallback(
    async (nodeId) => {
      console.log('=== ON STEP DELETE ===');
      console.log('Deleting node:', nodeId);
      console.log('Current nodes:', nodes);
      console.log('Current edges:', edges);
      
      const prevEdge = edges.find((edge) => edge.target === nodeId);
      const edgeToDelete = edges.find((edge) => edge.source === nodeId);

      const newEdges = edges
        .map((edge) => {
          if (
            edge.id === edgeToDelete?.id ||
            (edge.id === prevEdge?.id && !edgeToDelete)
          ) {
            return null;
          } else if (edge.id === prevEdge?.id) {
            return {
              ...prevEdge,
              target: edgeToDelete?.target,
            };
          }
          return edge;
        })
        .filter((edge) => !!edge);

      const newNodes = nodes.filter((node) => node.id !== nodeId);
      
      // IMPORTANT: Keep the laidOut flag and positions for remaining nodes
      const finalNodes = newNodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          laidOut: true, // Preserve laid out state
        }
      }));
      
      const finalEdges = newEdges.map(edge => ({
        ...edge,
        data: {
          ...edge.data,
          laidOut: true, // Preserve laid out state
        }
      }));
      
      console.log('Final nodes after delete:', finalNodes);
      console.log('Final edges after delete:', finalEdges);
      
      setNodes(finalNodes);
      setEdges(finalEdges);
    },
    [nodes, edges, setNodes, setEdges],
  );

  const onStepAdd = useCallback(
    async (previousStepId) => {
      console.log('🚀 === ON STEP ADD START ===');
      console.log('🔍 Previous step ID:', previousStepId);
      console.log('🔍 Current nodes count:', nodes.length);
      console.log('🔍 All current nodes:', nodes.map(n => ({ id: n.id, position: n.position, type: n.type })));
      
      const { data: createdStep } = await createStep({ previousStepId });
      console.log('✅ Created step from backend:', createdStep);
      console.log('🆔 New step ID:', createdStep.id);

      const previousNode = nodes.find(n => n.id === previousStepId);
      console.log('🔍 Found previous node:', previousNode);
      
      if (!previousNode) {
        console.error('❌ Previous node not found! This is the problem!');
        console.log('🔍 Available node IDs:', nodes.map(n => n.id));
        console.log('🔍 Looking for ID:', previousStepId);
      }
      
      // Calculate position for new node (below previous node)
      const newPosition = previousNode ? {
        x: previousNode.position.x,
        y: previousNode.position.y + 150,
      } : { 
        x: 300, // Default fallback position
        y: 150 
      };
      
      console.log('📍 Calculated new position:', newPosition);
      console.log('📍 Previous node position was:', previousNode?.position);
      
      const newNode = {
        id: createdStep.id,
        type: NODE_TYPES.FLOW_STEP,
        position: newPosition,
        data: {
          laidOut: true, // Mark as laid out immediately
        },
      };
      
      console.log('🆕 New node object:', newNode);

      // CRITICAL: Save the visual position to backend immediately
      console.log('💾 Saving visual position to backend:', newPosition);
      try {
        const updateResult = await updateStep({
          id: createdStep.id,
          visualPosition: newPosition,
        });
        console.log('✅ Backend update result:', updateResult);
      } catch (error) {
        console.error('❌ Backend update failed:', error);
      }

      const updatedNodes = nodes.flatMap((node) => {
        if (node.id === previousStepId) {
          console.log('🔄 Inserting new node after:', node.id);
          return [node, newNode];
        }
        // Update invisible node position to be below the new last node
        if (node.id === INVISIBLE_NODE_ID) {
          const newInvisiblePosition = {
            x: newPosition.x,
            y: newPosition.y + 150,
          };
          console.log('👻 Updating invisible node position to:', newInvisiblePosition);
          return {
            ...node,
            position: newInvisiblePosition
          };
        }
        return node;
      });
      
      console.log('🔄 Updated nodes array:', updatedNodes.map(n => ({ id: n.id, position: n.position, type: n.type })));

      const updatedEdges = edges
        .map((edge) => {
          if (edge.source === previousStepId) {
            const previousTarget = edge.target;
            console.log('🔗 Updating edge from', previousStepId, 'to split between', createdStep.id, 'and', previousTarget);
            return [
              { 
                ...edge, 
                target: createdStep.id,
                data: { ...edge.data, laidOut: true }
              },
              {
                id: uuidv4(),
                source: createdStep.id,
                target: previousTarget,
                type: EDGE_TYPES.ADD_NODE_EDGE,
                data: {
                  laidOut: true, // Mark as laid out
                },
              },
            ];
          }
          return edge;
        })
        .flat();

      // Ensure all nodes maintain their laidOut status
      const finalNodes = updatedNodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          laidOut: true,
        }
      }));
      
      console.log('🏁 Final nodes being set:', finalNodes.map(n => ({ id: n.id, position: n.position, type: n.type })));
      console.log('🏁 Final edges being set:', updatedEdges.length, 'edges');
      
      setNodes(finalNodes);
      setEdges(updatedEdges);
      
      console.log('🚀 === ON STEP ADD END ===');
    },
    [createStep, nodes, edges, setNodes, setEdges, updateStep],
  );

  const onNodesChange = useCallback(
    (changes) => {
      console.log('=== ON NODES CHANGE ===');
      console.log('Changes:', changes);
      
      const newNodes = applyNodeChanges(changes, nodes);
      console.log('New nodes after changes:', newNodes);
      
      setNodes(newNodes);
      
      // Save positions when nodes are dragged
      changes.forEach((change) => {
        if (change.type === 'position' && change.position && !change.dragging) {
          // Only save when drag is complete (dragging is false/undefined)
          console.log(`🎯 Saving position for node ${change.id}:`, change.position);
          
          const step = flow?.steps?.find(s => s.id === change.id);
          if (step) {
            updateStep({
              id: change.id,
              visualPosition: change.position
            });
          }
        }
      });
    },
    [nodes, setNodes, flow?.steps, updateStep],
  );

  const onStepSelect = useCallback((stepId) => {
    setSelectedStepId(stepId);
    setSidebarOpen(true);
  }, []);

  const onClearSelection = useCallback(() => {
    setSelectedStepId(null);
    setSidebarOpen(false);
  }, []);

  const onStepChange = useCallback(
    async (step) => {
      const payload = {
        id: step.id,
        key: step.key,
        parameters: step.parameters,
        connectionId: step.connection?.id,
      };

      if (step.name || step.keyLabel) {
        payload.name = step.name || step.keyLabel;
      }

      if (step.appKey) {
        payload.appKey = step.appKey;
      }

      await updateStep(payload);

      await queryClient.invalidateQueries({
        queryKey: ['steps', step.id, 'connection'],
      });
    },
    [updateStep, queryClient],
  );

  const onFlowChange = useCallback(
    async (flowData) => {
      await updateFlow(flowData);
    },
    [updateFlow],
  );

  const [initialNodes, setInitialNodes] = useState([]);
  const [initialEdges, setInitialEdges] = useState([]);

  useEffect(
    function initiateNodesAndEdges() {
      console.log('=== INITIATING NODES AND EDGES ===');
      console.log('Flow steps from backend:', flow?.steps);
      
      // Skip re-initialization if we already have nodes (prevents overriding during add/delete operations)
      if (nodes.length > 0) {
        console.log('⏭️ Skipping initialization - nodes already exist');
        return;
      }
      
      const newNodes = flow?.steps.map((step, index) => {
        console.log(`Step ${step.id}:`, {
          hasVisualPosition: !!step.visualPosition,
          visualPosition: step.visualPosition,
        });
        
        return {
          id: step.id,
          type: NODE_TYPES.FLOW_STEP,
          position: step.visualPosition || {
            x: 0,
            y: 0,
          },
          zIndex: index !== 0 ? 0 : 1,
          data: {
            laidOut: !!step.visualPosition, // True if position exists
          },
        };
      });

      // Position invisible node below the last step node
      const lastNode = newNodes[newNodes.length - 1];
      const invisibleNodePosition = lastNode ? {
        x: lastNode.position.x,
        y: lastNode.position.y + 150, // 150px below last node
      } : { x: 0, y: 150 };

      newNodes.push({
        id: INVISIBLE_NODE_ID,
        type: NODE_TYPES.INVISIBLE,
        position: invisibleNodePosition,
        data: {
          laidOut: true,
        },
      });

      console.log('Created nodes:', newNodes);

      const newEdges = newNodes
        .map((node, i) => {
          const sourceId = node.id;
          const targetId = newNodes[i + 1]?.id;
          if (targetId) {
            return {
              id: uuidv4(),
              source: sourceId,
              target: targetId,
              type: 'addNodeEdge',
              data: {
                // Edge is laid out if both connected nodes are laid out
                laidOut: node.data?.laidOut && newNodes[i + 1]?.data?.laidOut,
              },
            };
          }
          return null;
        })
        .filter((edge) => !!edge);

      console.log('Created edges:', newEdges);
      setInitialNodes(newNodes);
      setInitialEdges(newEdges);
    },
    [flow?.steps, nodes.length],
  );

  // Calculate the initial layout before browser paint
  useLayoutEffect(() => {
    console.log('=== USE LAYOUT EFFECT ===');
    console.log('Initial nodes:', initialNodes);
    console.log('Initial edges:', initialEdges);
    
    if (initialNodes.length > 0 && initialEdges.length >= 0) {
      // Check if ANY nodes have saved positions (excluding invisible node)
      const flowStepNodes = initialNodes.filter(n => n.type === NODE_TYPES.FLOW_STEP);
      const hasAnySavedPositions = flowStepNodes.some(node => 
        node.data?.laidOut && node.position.x !== 0 && node.position.y !== 0
      );
      
      console.log('Flow step nodes:', flowStepNodes);
      console.log('Has any saved positions?', hasAnySavedPositions);
      
      if (hasAnySavedPositions) {
        // Use existing positions - don't run auto-layout
        console.log('✅ Using saved positions - NO AUTO-LAYOUT');
        const finalNodes = initialNodes.map(node => ({
          ...node,
          data: { ...node.data, laidOut: true }
        }));
        const finalEdges = initialEdges.map(edge => ({
          ...edge,
          data: { ...edge.data, laidOut: true }
        }));
        
        console.log('Final nodes being set:', finalNodes);
        console.log('Final edges being set:', finalEdges);
        
        setNodes(finalNodes);
        setEdges(finalEdges);
      } else {
        // Use auto-layout for brand new flows only
        console.log('🔄 Running auto-layout for new flow');
        getLaidOutElements(initialNodes, initialEdges).then(
          ({ nodes: layoutedNodes, edges: layoutedEdges }) => {
            console.log('Auto-layouted nodes:', layoutedNodes);
            console.log('Auto-layouted edges:', layoutedEdges);
            
            setNodes(layoutedNodes);
            setEdges(layoutedEdges);
            
            // IMPORTANT: Save the auto-generated positions to backend
            layoutedNodes.forEach(node => {
              if (node.type === NODE_TYPES.FLOW_STEP) {
                console.log(`Saving auto-layout position for ${node.id}:`, node.position);
                updateStep({
                  id: node.id,
                  visualPosition: node.position,
                });
              }
            });
          },
        );
      }
    }
  }, [initialNodes, initialEdges, setNodes, setEdges, updateStep]);

  useEffect(function updateContainerHeightOnResize() {
    const updateHeight = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    };

    updateHeight();

    window.addEventListener('resize', updateHeight);

    return () => {
      window.removeEventListener('resize', updateHeight);
    };
  }, []);

  // Auto-select trigger step when editor loads
  useEffect(
    function autoSelectTriggerStep() {
      if (ENABLE_AUTO_SELECT === false) return;

      if (flow?.steps?.length > 0 && !selectedStepId) {
        const triggerStep = flow.steps[0]; // First step is always trigger
        setSelectedStepId(triggerStep.id);
        setSidebarOpen(true);
      }
    },
    [flow?.steps, selectedStepId],
  );

  return (
    <NodesContext.Provider
      value={{
        onStepChange,
        onFlowChange,
        onStepDelete,
        onStepSelect,
        onClearSelection,
        selectedStepId,
        sidebarOpen,
        flowId: flow?.id,
        steps: flow?.steps,
      }}
    >
      <EditorWrapper ref={containerRef}>
        <EdgesContext.Provider
          value={{
            flowActive: flow?.active,
            isCreateStepPending,
            onStepAdd,
          }}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            edgesFocusable={false}
            elementsSelectable={true}
            nodesConnectable={false}
            nodesDraggable={true}
            snapToGrid={false}
            snapGrid={[15, 15]}
            nodesFocusable={true}
            panOnDrag={true}
            panOnScroll
            panOnScrollMode={PanOnScrollMode.Free}
            zoomOnDoubleClick={true}
            zoomOnPinch={true}
            zoomOnScroll={true}
            minZoom={0.5}
            maxZoom={2}
            proOptions={{ hideAttribution: true }}
          />
        </EdgesContext.Provider>
        <StepDetailsSidebar key={selectedStepId} open={sidebarOpen} />
      </EditorWrapper>
    </NodesContext.Provider>
  );
};

Editor.propTypes = {
  flow: FlowPropType.isRequired,
};

export default Editor;
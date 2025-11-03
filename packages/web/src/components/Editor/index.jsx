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
      setNodes(newNodes);
      setEdges(newEdges);
    },
    [nodes, edges, setNodes, setEdges],
  );

  const onStepAdd = useCallback(
    async (previousStepId) => {
      const { data: createdStep } = await createStep({ previousStepId });

      const previousNode = nodes.find(n => n.id === previousStepId);
      const newNode = {
        id: createdStep.id,
        type: NODE_TYPES.FLOW_STEP,
        position: previousNode ? {
          x: previousNode.position.x,
          y: previousNode.position.y + 150,
        } : { x: 0, y: 0 },
        data: {
          laidOut: true,
        },
      };

      const updatedNodes = nodes.flatMap((node) => {
        if (node.id === previousStepId) {
          return [node, newNode];
        }
        return node;
      });

      const updatedEdges = edges
        .map((edge) => {
          if (edge.source === previousStepId) {
            const previousTarget = edge.target;
            return [
              { ...edge, target: createdStep.id },
              {
                id: uuidv4(),
                source: createdStep.id,
                target: previousTarget,
                type: EDGE_TYPES.ADD_NODE_EDGE,
                data: {
                  laidOut: true,
                },
              },
            ];
          }
          return edge;
        })
        .flat();

      setNodes(updatedNodes);
      setEdges(updatedEdges);
    },
    [createStep, nodes, edges, setNodes, setEdges],
  );



  const onNodesChange = useCallback(
    (changes) => {
      const newNodes = applyNodeChanges(changes, nodes);
      setNodes(newNodes);
      
      // Save positions when nodes are dragged
      changes.forEach((change) => {
        if (change.type === 'position' && change.position) {
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
      const newNodes = flow?.steps.map((step, index) => {
        return {
          id: step.id,
          type: NODE_TYPES.FLOW_STEP,
          position: step.visualPosition || {
            x: 0,
            y: 0,
          },
          zIndex: index !== 0 ? 0 : 1,
          data: {
            laidOut: !!step.visualPosition,
          },
        };
      });

      newNodes.push({
        id: INVISIBLE_NODE_ID,
        type: NODE_TYPES.INVISIBLE,
        position: {
          x: 0,
          y: 0,
        },
      });

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
                laidOut: false,
              },
            };
          }
          return null;
        })
        .filter((edge) => !!edge);

      setInitialNodes(newNodes);
      setInitialEdges(newEdges);
    },
    [flow?.steps],
  );

  // Calculate the initial layout before browser paint
  useLayoutEffect(() => {
    if (initialNodes.length > 0 && initialEdges.length >= 0) {
      // Check if nodes already have saved positions
      const hasCustomPositions = initialNodes.some(node => 
        node.data?.laidOut
      );
      
      if (hasCustomPositions) {
        // Use existing positions, just mark as laid out
        setNodes(initialNodes.map(node => ({
          ...node,
          data: { ...node.data, laidOut: true }
        })));
        setEdges(initialEdges.map(edge => ({
          ...edge,
          data: { ...edge.data, laidOut: true }
        })));
      } else {
        // Use auto-layout for new flows
        getLaidOutElements(initialNodes, initialEdges).then(
          ({ nodes: layoutedNodes, edges: layoutedEdges }) => {
            setNodes(layoutedNodes);
            setEdges(layoutedEdges);
          },
        );
      }
    }
  }, [initialNodes, initialEdges, setNodes, setEdges]);

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

  // Disable auto-relayout on resize to preserve user positioning
  // useEffect(
  //   function reLayoutOnWindowResize() {
  //     // Disabled to allow free positioning
  //   },
  //   [nodes, edges, setNodes, setEdges],
  // );

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

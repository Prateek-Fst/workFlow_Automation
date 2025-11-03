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
import WorkflowImporter from './WorkflowImporter';
import { DirectedGraph } from './DirectedGraph';
import { WorkflowExecute } from './WorkflowExecute';

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
      const { data: createdStep } = await createStep({ previousStepId });
      
      const previousNode = nodes.find(n => n.id === previousStepId);
      if (!previousNode) return;
      
      const newPosition = {
        x: previousNode.position.x,
        y: previousNode.position.y + 150,
      };
      
      const newNode = {
        id: createdStep.id,
        type: NODE_TYPES.FLOW_STEP,
        position: newPosition,
        data: { laidOut: true },
      };

      await updateStep({
        id: createdStep.id,
        visualPosition: newPosition,
      });

      const updatedNodes = nodes.flatMap((node) => {
        if (node.id === previousStepId) {
          return [node, newNode];
        }
        if (node.id === INVISIBLE_NODE_ID) {
          return {
            ...node,
            position: {
              x: newPosition.x,
              y: newPosition.y + 150,
            }
          };
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
                data: { laidOut: true },
              },
            ];
          }
          return edge;
        })
        .flat();

      setNodes(updatedNodes);
      setEdges(updatedEdges);
    },
    [createStep, nodes, edges, setNodes, setEdges, updateStep],
  );

  const handleWorkflowImport = useCallback((workflow) => {
    console.log('🔄 Importing Automatisch workflow:', workflow);
    
    // Create DirectedGraph instance
    const graph = new DirectedGraph();
    
    // Add steps to graph
    workflow.steps.forEach(step => {
      graph.addNode(step.id, {
        id: step.id,
        name: step.name,
        type: step.type,
        structuralType: step.structuralType,
        parentStepId: step.parentStepId,
        branchConditions: step.branchConditions
      });
    });
    
    // Convert steps to visual nodes
    const importedNodes = workflow.steps.map((step) => ({
      id: step.id,
      type: NODE_TYPES.FLOW_STEP,
      position: step.visualPosition || { x: 0, y: 0 },
      data: { 
        laidOut: true,
        structuralType: step.structuralType,
        parentStepId: step.parentStepId,
        branchConditions: step.branchConditions
      },
    }));
    
    // Add invisible node
    const lastNode = importedNodes[importedNodes.length - 1];
    importedNodes.push({
      id: INVISIBLE_NODE_ID,
      type: NODE_TYPES.INVISIBLE,
      position: {
        x: lastNode?.position.x || 300,
        y: (lastNode?.position.y || 550) + 150,
      },
      data: { laidOut: true },
    });
    
    // Create edges from connections
    const importedEdges = [];
    
    Object.entries(workflow.connections).forEach(([sourceStepId, targetStepIds]) => {
      const sourceStep = workflow.steps.find(s => s.id === sourceStepId);
      if (!sourceStep) return;
      
      targetStepIds.forEach((targetStepId, index) => {
        const targetStep = workflow.steps.find(s => s.id === targetStepId);
        if (targetStep) {
          // Add to graph
          graph.addConnection(sourceStepId, targetStepId, 0, 0);
          
          // Create visual edge
          importedEdges.push({
            id: uuidv4(),
            source: sourceStepId,
            target: targetStepId,
            type: EDGE_TYPES.ADD_NODE_EDGE,
            data: {
              laidOut: true,
              branchIndex: index,
            },
          });
        }
      });
    });
    
    // Add edges to invisible node from leaf nodes
    const connectedNodeIds = new Set(importedEdges.map(e => e.target));
    const leafNodes = importedNodes.filter(node => 
      node.type === NODE_TYPES.FLOW_STEP && !connectedNodeIds.has(node.id)
    );
    
    leafNodes.forEach((leafNode) => {
      importedEdges.push({
        id: uuidv4(),
        source: leafNode.id,
        target: INVISIBLE_NODE_ID,
        type: EDGE_TYPES.ADD_NODE_EDGE,
        data: { laidOut: true },
      });
    });
    
    // Create workflow executor
    const executor = new WorkflowExecute(graph);
    
    // Test execution
    const startNodes = graph.findStartNodes();
    if (startNodes.length > 0) {
      console.log('🏁 Testing multi-branch execution...');
      executor.executeWorkflow(startNodes[0]).then(result => {
        console.log('✅ Multi-branch execution completed:', result);
      });
    }
    
    console.log('✅ Imported nodes:', importedNodes);
    console.log('✅ Imported edges:', importedEdges);
    console.log('🔗 Graph connections:', graph.connectionsBySourceNode);
    
    setNodes(importedNodes);
    setEdges(importedEdges);
  }, [setNodes, setEdges]);

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
          structuralType: step.structuralType,
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
            laidOut: !!step.visualPosition,
            structuralType: step.structuralType,
            parentStepId: step.parentStepId,
            branchConditions: step.branchConditions,
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
        <WorkflowImporter onImport={handleWorkflowImport} />
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
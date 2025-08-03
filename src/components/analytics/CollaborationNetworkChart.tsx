'use client';

/**
 * CollaborationNetworkChart Component
 * Displays a force-directed graph of team collaboration
 */

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import * as d3 from 'd3';
import type { CollaborationMetrics } from '@/lib/types/analytics';

interface CollaborationNetworkChartProps {
  collaboration: CollaborationMetrics;
}

export default function CollaborationNetworkChart({ collaboration }: CollaborationNetworkChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  
  // Get network data
  const { nodes, links } = collaboration.collaborationNetwork;
  
  // Get selected node data
  const nodeData = selectedNode 
    ? nodes.find(node => node.id === selectedNode)
    : null;
  
  // Get connections for selected node
  const nodeConnections = selectedNode
    ? links.filter(link => link.source === selectedNode || link.target === selectedNode)
    : [];
  
  // Memoize the network data to prevent unnecessary re-renders
  const memoizedNodes = useMemo(() => nodes, [nodes]);
  const memoizedLinks = useMemo(() => links, [links]);
  
  // Track if the component is visible in viewport
  const [isVisible, setIsVisible] = useState(false);
  
  // Use intersection observer to only render when visible
  useEffect(() => {
    if (!svgRef.current) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    
    observer.observe(svgRef.current);
    
    return () => {
      observer.disconnect();
    };
  }, []);
  
  useEffect(() => {
    if (!svgRef.current || !memoizedNodes.length || !isVisible) return;
    
    // Clear previous visualization
    d3.select(svgRef.current).selectAll("*").remove();
    
    const width = svgRef.current.clientWidth;
    const height = 500;
    
    // Performance optimization: Adjust simulation parameters based on node count
    const nodeCount = memoizedNodes.length;
    const isLargeNetwork = nodeCount > 50;
    
    // Create a simulation with forces - optimized for performance
    const simulation = d3.forceSimulation(memoizedNodes as any)
      .force("link", d3.forceLink(memoizedLinks as any).id((d: any) => d.id).distance(isLargeNetwork ? 50 : 100))
      .force("charge", d3.forceManyBody().strength(isLargeNetwork ? -200 : -400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("x", d3.forceX(width / 2).strength(isLargeNetwork ? 0.2 : 0.1))
      .force("y", d3.forceY(height / 2).strength(isLargeNetwork ? 0.2 : 0.1))
      // Reduce alpha decay for large networks to stabilize faster
      .alphaDecay(isLargeNetwork ? 0.05 : 0.02);
    
    // Create SVG elements
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height);
    
    // Define color scale for groups
    const color = d3.scaleOrdinal(d3.schemeCategory10);
    
    // Create links
    const link = svg.append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", (d) => Math.sqrt(d.value));
    
    // Create nodes with optimized rendering
    const node = svg.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(memoizedNodes)
      .join("circle")
      .attr("r", (d) => {
        // Smaller nodes for large networks
        const baseSize = isLargeNetwork ? 3 : 5;
        return baseSize + Math.sqrt(d.group) * (isLargeNetwork ? 2 : 3);
      })
      .attr("fill", (d) => color(d.group.toString()))
      .on("click", (event, d: any) => {
        event.stopPropagation();
        setSelectedNode(d.id);
      })
      .call(drag(simulation) as any);
    
    // Add tooltips
    node.append("title")
      .text((d: any) => `${d.name}\nGroup: ${d.group}`);
    
    // Add labels - only for smaller networks or important nodes
    const labels = svg.append("g")
      .attr("class", "labels")
      .selectAll("text")
      .data(memoizedNodes.filter((d: any) => {
        // For large networks, only show labels for important nodes
        if (isLargeNetwork) {
          // Count connections for this node
          const connectionCount = memoizedLinks.filter(
            (link: any) => link.source === d.id || link.target === d.id
          ).length;
          
          // Only show labels for nodes with many connections
          return connectionCount > Math.max(2, memoizedNodes.length / 10);
        }
        return true;
      }))
      .enter()
      .append("text")
      .text((d: any) => d.name)
      .attr("font-size", isLargeNetwork ? 8 : 10)
      .attr("dx", 12)
      .attr("dy", 4)
      .style("pointer-events", "none"); // Improve performance by disabling pointer events
    
    // Add click handler to clear selection
    svg.on("click", () => {
      setSelectedNode(null);
    });
    
    // Performance optimization: Throttle updates for large networks
    let tickCounter = 0;
    
    // Update positions on simulation tick with throttling for large networks
    simulation.on("tick", () => {
      // For large networks, only update every few ticks to improve performance
      if (isLargeNetwork && tickCounter++ % 3 !== 0) return;
      
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);
      
      node
        .attr("cx", (d: any) => d.x)
        .attr("cy", (d: any) => d.y);
      
      labels
        .attr("x", (d: any) => d.x)
        .attr("y", (d: any) => d.y);
    });
    
    // Performance optimization: Stop simulation after a reasonable time
    setTimeout(() => {
      simulation.stop();
    }, isLargeNetwork ? 3000 : 5000);
    
    // Drag functionality
    function drag(simulation: any) {
      function dragstarted(event: any, d: any) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }
      
      function dragged(event: any, d: any) {
        d.fx = event.x;
        d.fy = event.y;
      }
      
      function dragended(event: any, d: any) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }
      
      return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }
    
    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [nodes, links, selectedNode]);
  
  if (!nodes.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Collaboration Network</CardTitle>
          <CardDescription>
            How team members collaborate with each other
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-80 bg-gray-50 rounded-md dark:bg-gray-700/30">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No collaboration data available. This could be due to insufficient team activity.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Collaboration Network</CardTitle>
          <CardDescription>
            How team members collaborate with each other. Click on a node to see details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md overflow-hidden">
            <svg ref={svgRef} className="w-full" style={{ minHeight: '500px' }}></svg>
          </div>
        </CardContent>
      </Card>
      
      {selectedNode && nodeData && (
        <Card>
          <CardHeader>
            <CardTitle>{nodeData.name}</CardTitle>
            <CardDescription>
              Collaboration details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Group</h3>
                <p className="text-lg font-medium">{nodeData.group}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Connections</h3>
                <ul className="mt-2 space-y-2">
                  {nodeConnections.map((connection, index) => {
                    const isSource = connection.source === selectedNode;
                    const connectedNodeId = isSource ? connection.target : connection.source;
                    const connectedNode = nodes.find(node => node.id === connectedNodeId);
                    
                    return (
                      <li key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md dark:bg-gray-800">
                        <span>{connectedNode?.name}</span>
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900 dark:text-blue-200">
                          Strength: {connection.value}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
              
              {nodeConnections.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No direct collaborations found for this team member.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Network Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {generateNetworkInsights(collaboration)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Generate insights based on collaboration network
 */
function generateNetworkInsights(collaboration: CollaborationMetrics): JSX.Element[] {
  const insights: JSX.Element[] = [];
  const { nodes, links } = collaboration.collaborationNetwork;
  
  // Calculate network density
  const density = calculateNetworkDensity(nodes.length, links.length);
  
  // Identify isolated nodes
  const isolatedNodes = findIsolatedNodes(nodes, links);
  
  // Identify central nodes
  const centralNodes = findCentralNodes(nodes, links);
  
  // Network density insight
  if (density < 0.3) {
    insights.push(
      <div key="low-density" className="p-3 bg-amber-50 rounded-md border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
        <p className="text-amber-800 dark:text-amber-300">
          <span className="font-semibold">Low Collaboration Density:</span> Your team's collaboration network has a density of {(density * 100).toFixed(1)}%, indicating limited cross-collaboration. Consider implementing pair programming or cross-functional teams.
        </p>
      </div>
    );
  } else if (density > 0.7) {
    insights.push(
      <div key="high-density" className="p-3 bg-green-50 rounded-md border border-green-200 dark:bg-green-900/20 dark:border-green-800">
        <p className="text-green-800 dark:text-green-300">
          <span className="font-semibold">High Collaboration Density:</span> Your team has excellent cross-collaboration with a network density of {(density * 100).toFixed(1)}%.
        </p>
      </div>
    );
  }
  
  // Isolated nodes insight
  if (isolatedNodes.length > 0) {
    insights.push(
      <div key="isolated-nodes" className="p-3 bg-red-50 rounded-md border border-red-200 dark:bg-red-900/20 dark:border-red-800">
        <p className="text-red-800 dark:text-red-300">
          <span className="font-semibold">Isolated Team Members:</span> {isolatedNodes.length} team members have limited collaboration with others. Consider ways to integrate {isolatedNodes.length === 1 ? 'this member' : 'these members'} more into the team workflow.
        </p>
      </div>
    );
  }
  
  // Central nodes insight
  if (centralNodes.length > 0) {
    insights.push(
      <div key="central-nodes" className="p-3 bg-blue-50 rounded-md border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
        <p className="text-blue-800 dark:text-blue-300">
          <span className="font-semibold">Key Collaborators:</span> {centralNodes.map(node => node.name).join(', ')} {centralNodes.length === 1 ? 'is a central' : 'are central'} figure{centralNodes.length === 1 ? '' : 's'} in your team's collaboration network. {centralNodes.length === 1 ? 'This person' : 'These people'} may be critical for knowledge sharing and team cohesion.
        </p>
      </div>
    );
  }
  
  // If no insights, add a general one
  if (insights.length === 0) {
    insights.push(
      <div key="general" className="p-3 bg-blue-50 rounded-md border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
        <p className="text-blue-800 dark:text-blue-300">
          <span className="font-semibold">Balanced Collaboration:</span> Your team shows a balanced collaboration pattern. Continue monitoring for any changes in collaboration dynamics.
        </p>
      </div>
    );
  }
  
  return insights;
}

/**
 * Calculate network density
 */
function calculateNetworkDensity(nodeCount: number, linkCount: number): number {
  if (nodeCount <= 1) return 0;
  
  // Maximum possible links in a fully connected network
  const maxLinks = (nodeCount * (nodeCount - 1)) / 2;
  
  // Network density (0-1)
  return maxLinks > 0 ? linkCount / maxLinks : 0;
}

/**
 * Find isolated nodes (nodes with few or no connections)
 */
function findIsolatedNodes(
  nodes: { id: string; name: string; group: number }[],
  links: { source: string; target: string; value: number }[]
): { id: string; name: string }[] {
  // Count connections for each node
  const connectionCounts = new Map<string, number>();
  
  // Initialize all nodes with 0 connections
  nodes.forEach(node => {
    connectionCounts.set(node.id, 0);
  });
  
  // Count connections
  links.forEach(link => {
    const sourceId = typeof link.source === 'string' ? link.source : link.source;
    const targetId = typeof link.target === 'string' ? link.target : link.target;
    
    connectionCounts.set(sourceId, (connectionCounts.get(sourceId) || 0) + 1);
    connectionCounts.set(targetId, (connectionCounts.get(targetId) || 0) + 1);
  });
  
  // Find nodes with 0 or 1 connection
  return nodes
    .filter(node => (connectionCounts.get(node.id) || 0) <= 1)
    .map(node => ({ id: node.id, name: node.name }));
}

/**
 * Find central nodes (nodes with many connections)
 */
function findCentralNodes(
  nodes: { id: string; name: string; group: number }[],
  links: { source: string; target: string; value: number }[]
): { id: string; name: string }[] {
  // Count connections for each node
  const connectionCounts = new Map<string, number>();
  
  // Initialize all nodes with 0 connections
  nodes.forEach(node => {
    connectionCounts.set(node.id, 0);
  });
  
  // Count connections
  links.forEach(link => {
    const sourceId = typeof link.source === 'string' ? link.source : link.source;
    const targetId = typeof link.target === 'string' ? link.target : link.target;
    
    connectionCounts.set(sourceId, (connectionCounts.get(sourceId) || 0) + 1);
    connectionCounts.set(targetId, (connectionCounts.get(targetId) || 0) + 1);
  });
  
  // Calculate average connections
  const totalConnections = Array.from(connectionCounts.values()).reduce((sum, count) => sum + count, 0);
  const avgConnections = totalConnections / nodes.length;
  
  // Find nodes with significantly more connections than average (1.5x average)
  return nodes
    .filter(node => (connectionCounts.get(node.id) || 0) > avgConnections * 1.5)
    .map(node => ({ id: node.id, name: node.name }));
}
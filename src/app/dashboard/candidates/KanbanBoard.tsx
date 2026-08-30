"use client"

import React, { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { updateCandidateStage } from '@/app/actions/candidates'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const STAGES = [
  'APPLIED',
  'AI_REVIEWED',
  'RECRUITER_REVIEW',
  'SHORTLISTED',
  'INTERVIEW',
  'OFFER_SENT',
  'REJECTED'
]

type Application = any 

export default function KanbanBoard({ initialApplications }: { initialApplications: Application[] }) {
  const [columns, setColumns] = useState<Record<string, Application[]>>({})

  // Initialize columns
  useEffect(() => {
    const cols: Record<string, Application[]> = {}
    STAGES.forEach(stage => {
      cols[stage] = initialApplications.filter(app => app.stage === stage)
    })
    
    // Catch any applications in unknown stages and put them in APPLIED
    initialApplications.forEach(app => {
      if (!STAGES.includes(app.stage)) {
        if (!cols['APPLIED']) cols['APPLIED'] = []
        cols['APPLIED'].push(app)
      }
    })
    
    setColumns(cols)
  }, [initialApplications])

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return

    const { source, destination, draggableId } = result

    if (source.droppableId === destination.droppableId) {
      // Reordering in the same column is not strictly needed for this MVP, but we handle the drop gracefully
      return
    }

    // Move to new column optimistically
    const sourceCol = [...(columns[source.droppableId] || [])]
    const destCol = [...(columns[destination.droppableId] || [])]
    
    const [movedItem] = sourceCol.splice(source.index, 1)
    movedItem.stage = destination.droppableId
    destCol.splice(destination.index, 0, movedItem)

    setColumns({
      ...columns,
      [source.droppableId]: sourceCol,
      [destination.droppableId]: destCol,
    })

    // Call server action to persist the change
    await updateCandidateStage(draggableId, destination.droppableId)
  }

  const formatStage = (stage: string) => stage.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

  if (Object.keys(columns).length === 0) {
    return <div>Loading Board...</div>
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-200px)]">
        {STAGES.map((stageId) => (
          <div key={stageId} className="flex flex-col min-w-[300px] w-[300px] bg-gray-100 rounded-lg p-3">
            <h3 className="font-semibold text-sm text-gray-700 mb-3 uppercase tracking-wider">
              {formatStage(stageId)} ({columns[stageId]?.length || 0})
            </h3>
            
            <Droppable droppableId={stageId}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex-1 overflow-y-auto transition-colors ${
                    snapshot.isDraggingOver ? 'bg-gray-200 rounded-md' : ''
                  }`}
                  style={{ minHeight: '150px' }}
                >
                  {columns[stageId]?.map((app, index) => (
                    <Draggable key={app.id} draggableId={app.id} index={index}>
                      {(provided, snapshot) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`mb-3 shadow-sm border ${snapshot.isDragging ? 'shadow-md border-blue-400' : 'border-gray-200'}`}
                        >
                          <CardHeader className="p-4 pb-2">
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-base font-semibold leading-tight">
                                {app.candidates?.full_name}
                              </CardTitle>
                              {app.fit_score && (
                                <Badge variant={app.fit_score >= 80 ? 'default' : 'secondary'}>
                                  {app.fit_score}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{app.candidates?.email}</p>
                          </CardHeader>
                          <CardContent className="p-4 pt-0 text-sm">
                            <p className="font-medium text-gray-700 mt-2 truncate">{app.jobs?.title}</p>
                            <p className="text-xs text-gray-500 mt-1">Applied: {new Date(app.created_at).toLocaleDateString()}</p>
                          </CardContent>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  )
}

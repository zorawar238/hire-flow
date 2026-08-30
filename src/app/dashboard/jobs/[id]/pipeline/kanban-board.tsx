'use client'

import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { updateCandidateStage } from '@/app/actions/candidates'
import Link from 'next/link'

const STAGES = [
  'APPLIED',
  'AI_REVIEWED',
  'RECRUITER_REVIEW',
  'SHORTLISTED',
  'SCREENING_CALL',
  'INTERVIEW',
  'OFFER_APPROVAL',
  'OFFER_SENT',
  'OFFER_ACCEPTED',
  'JOINED',
  'REJECTED',
  'WITHDRAWN'
]

const STAGE_LABELS: Record<string, string> = {
  APPLIED: 'Applied',
  AI_REVIEWED: 'AI Reviewed',
  RECRUITER_REVIEW: 'Recruiter Review',
  SHORTLISTED: 'Shortlisted',
  SCREENING_CALL: 'Screening',
  INTERVIEW: 'Interview',
  OFFER_APPROVAL: 'Offer Approval',
  OFFER_SENT: 'Offer Sent',
  OFFER_ACCEPTED: 'Offer Accepted',
  JOINED: 'Joined',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn'
}

type KanbanBoardProps = {
  applications: any[]
  jobId: string
}

export default function KanbanBoard({ applications: initialApps, jobId }: KanbanBoardProps) {
  const [columns, setColumns] = useState<Record<string, any[]>>({})
  const [isBrowser, setIsBrowser] = useState(false)

  useEffect(() => {
    setIsBrowser(true)
    const initialColumns: Record<string, any[]> = {}
    STAGES.forEach(stage => {
      initialColumns[stage] = initialApps
        .filter(app => app.stage === stage)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    })
    setColumns(initialColumns)
  }, [initialApps])

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return

    const { source, destination, draggableId } = result

    if (source.droppableId !== destination.droppableId) {
      const sourceColumn = [...columns[source.droppableId]]
      const destColumn = [...columns[destination.droppableId]]
      
      const [movedItem] = sourceColumn.splice(source.index, 1)
      movedItem.stage = destination.droppableId
      
      destColumn.splice(destination.index, 0, movedItem)

      setColumns({
        ...columns,
        [source.droppableId]: sourceColumn,
        [destination.droppableId]: destColumn
      })

      // Update in DB
      await updateCandidateStage(draggableId, destination.droppableId)
    } else {
      const column = [...columns[source.droppableId]]
      const [movedItem] = column.splice(source.index, 1)
      column.splice(destination.index, 0, movedItem)

      setColumns({
        ...columns,
        [source.droppableId]: column
      })
    }
  }

  if (!isBrowser) {
    return null // Avoid hydration mismatch
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 h-[calc(100vh-12rem)] overflow-x-auto pb-4">
        {STAGES.map(stage => (
          <div key={stage} className="flex-shrink-0 w-80 flex flex-col bg-gray-50 rounded-lg">
            <div className="p-3 font-semibold text-sm text-gray-700 flex justify-between items-center border-b border-gray-200">
              {STAGE_LABELS[stage]}
              <Badge variant="secondary">{columns[stage]?.length || 0}</Badge>
            </div>
            
            <Droppable droppableId={stage}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex-1 p-3 overflow-y-auto ${snapshot.isDraggingOver ? 'bg-blue-50/50' : ''}`}
                >
                  {columns[stage]?.map((app, index) => (
                    <Draggable key={app.id} draggableId={app.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="mb-3"
                          style={{
                            ...provided.draggableProps.style,
                            opacity: snapshot.isDragging ? 0.8 : 1,
                          }}
                        >
                          <Card className="shadow-sm cursor-grab active:cursor-grabbing hover:border-blue-300 transition-colors">
                            <CardContent className="p-3">
                              <Link href={`/dashboard/applications/${app.id}`} className="block hover:opacity-80">
                                <div className="font-medium text-sm mb-1">{app.candidates?.full_name}</div>
                                <div className="text-xs text-muted-foreground truncate mb-2">
                                  {app.candidates?.current_designation || 'No Designation'} at {app.candidates?.current_company || 'Unknown'}
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                  <span className="text-xs text-gray-500">{app.candidates?.total_experience} Yrs</span>
                                  {app.fit_score != null && (
                                    <Badge variant={app.fit_score > 75 ? 'default' : app.fit_score > 50 ? 'secondary' : 'destructive'} className="text-[10px] px-1 py-0 h-4">
                                      {app.fit_score}% Fit
                                    </Badge>
                                  )}
                                </div>
                              </Link>
                            </CardContent>
                          </Card>
                        </div>
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

import React, { useState } from 'react';
import { KanbanState, KanbanTask, Project } from '@/types';

interface KanbanBoardProps {
  project: Project;
  updateProject: (updatedProject: Project) => void;
}

type KanbanColumn = keyof KanbanState;

const KanbanColumnComponent: React.FC<{
  title: string;
  tasks: KanbanTask[];
  columnId: KanbanColumn;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: number, sourceColumn: KanbanColumn) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, targetColumn: KanbanColumn) => void;
}> = ({ title, tasks, columnId, onDragStart, onDragOver, onDrop }) => {
  return (
    <div
      className="bg-slate-100 dark:bg-slate-700/50 rounded-lg p-4 flex-1"
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, columnId)}
    >
      <h3 className="font-bold text-lg mb-4 pb-2 border-b border-slate-300 dark:border-slate-600">{title}</h3>
      <div className="space-y-3 min-h-[200px]">
        {tasks.map((task) => (
          <div
            key={task.id}
            draggable
            onDragStart={(e) => onDragStart(e, task.id, columnId)}
            className="bg-white dark:bg-slate-800 p-3 rounded-md shadow-sm cursor-grab active:cursor-grabbing"
          >
            {task.content}
          </div>
        ))}
      </div>
    </div>
  );
};


const KanbanBoard: React.FC<KanbanBoardProps> = ({ project, updateProject }) => {
  const [kanbanState, setKanbanState] = useState<KanbanState>(project.kanban);
  const [newTaskContent, setNewTaskContent] = useState('');
  const [selectedMilestone, setSelectedMilestone] = useState<number | null>(project.timeline[0]?.id || null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: number, sourceColumn: KanbanColumn) => {
    e.dataTransfer.setData('taskId', taskId.toString());
    e.dataTransfer.setData('sourceColumn', sourceColumn);
    e.currentTarget.classList.add('dragging');
  };
  
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
      e.currentTarget.classList.remove('dragging');
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetColumn: KanbanColumn) => {
    e.preventDefault();
    const taskId = parseInt(e.dataTransfer.getData('taskId'), 10);
    const sourceColumn = e.dataTransfer.getData('sourceColumn') as KanbanColumn;

    if (sourceColumn === targetColumn) return;

    let taskToMove: KanbanTask | undefined;
    const newSourceTasks = kanbanState[sourceColumn].filter(task => {
      if (task.id === taskId) {
        taskToMove = task;
        return false;
      }
      return true;
    });

    if (!taskToMove) return;

    const newTargetTasks = [...kanbanState[targetColumn], taskToMove];

    const newKanbanState: KanbanState = {
      ...kanbanState,
      [sourceColumn]: newSourceTasks,
      [targetColumn]: newTargetTasks,
    };
    
    setKanbanState(newKanbanState);
    updateProject({ ...project, kanban: newKanbanState });

    // Remove dragging style from all elements
    document.querySelectorAll('.dragging').forEach(el => el.classList.remove('dragging'));
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskContent.trim() || selectedMilestone === null) {
        alert("태스크 내용과 마일스톤을 모두 선택해주세요.");
        return;
    }
    const newTask: KanbanTask = {
      id: Date.now(),
      content: newTaskContent.trim(),
      milestoneId: selectedMilestone
    };
    const newKanbanState = {
      ...kanbanState,
      todo: [...kanbanState.todo, newTask]
    };
    setKanbanState(newKanbanState);
    updateProject({ ...project, kanban: newKanbanState });
    setNewTaskContent('');
  };

  return (
    <div onDragEnd={handleDragEnd}>
        <form onSubmit={handleAddTask} className="mb-6 flex flex-col md:flex-row gap-4 items-center">
            <input 
                type="text"
                value={newTaskContent}
                onChange={(e) => setNewTaskContent(e.target.value)}
                placeholder="새 태스크 추가..."
                className="flex-grow bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none w-full md:w-auto"
            />
            <select
                value={selectedMilestone ?? ''}
                onChange={(e) => setSelectedMilestone(parseInt(e.target.value, 10))}
                className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none w-full md:w-auto"
            >
                <option value="" disabled>마일스톤 선택</option>
                {project.timeline.map(m => (
                    <option key={m.id} value={m.id}>{m.title}</option>
                ))}
            </select>
            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition w-full md:w-auto">추가</button>
        </form>
      <div className="flex flex-col md:flex-row gap-6">
        <KanbanColumnComponent
          title="To Do"
          tasks={kanbanState.todo}
          columnId="todo"
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        />
        <KanbanColumnComponent
          title="In Progress"
          tasks={kanbanState.inprogress}
          columnId="inprogress"
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        />
        <KanbanColumnComponent
          title="Done"
          tasks={kanbanState.done}
          columnId="done"
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        />
      </div>
    </div>
  );
};

export default KanbanBoard;